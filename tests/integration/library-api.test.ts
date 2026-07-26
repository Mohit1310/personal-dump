import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
	DELETE as deleteDump,
	GET as getDump,
	PATCH as patchDump,
} from "@/app/api/dumps/[id]/route";
import { GET as listDumps } from "@/app/api/dumps/route";
import { db } from "@/server/db";

const request = (query = "") =>
	new Request(`http://localhost/api/dumps${query ? `?${query}` : ""}`);
const detailContext = (id: string) => ({ params: Promise.resolve({ id }) });
const mutationRequest = (method: "PATCH" | "DELETE", body?: unknown) =>
	new Request("http://localhost/api/dumps/example", {
		method,
		body: body === undefined ? undefined : JSON.stringify(body),
		headers: { "content-type": "application/json" },
	});

describe("Knowledge Library APIs", () => {
	const dumpIds: string[] = [];
	const namespace = `library-${randomUUID()}`;

	beforeAll(async () => {
		const createdAt = new Date("2026-07-26T12:00:00.000Z");
		const dumps = await Promise.all(
			[
				{
					content: `${namespace} Prisma pagination solution`,
					title: "Prisma pagination",
					type: "solution" as const,
					tags: ["database-setup"],
					source: "Shell history",
				},
				{
					content: `${namespace} unrelated error`,
					title: "Network error",
					type: "error" as const,
					tags: ["network"],
					source: "Browser console",
				},
				{
					content: `${namespace} Prisma alternate solution`,
					title: "Alternate pagination",
					type: "solution" as const,
					tags: ["database-setup"],
					source: "Shell history",
				},
			].map((data) => db.dump.create({ data: { ...data, createdAt } })),
		);
		dumpIds.push(...dumps.map((dump) => dump.id));
	});

	afterAll(async () => {
		await db.dump.deleteMany({ where: { id: { in: dumpIds } } });
		await db.$disconnect();
	});

	it("paginates in a stable createdAt/id order without exposing content", async () => {
		const query = `q=${encodeURIComponent(namespace)}&pageSize=2`;
		const firstPage = await listDumps(request(query));
		const secondPage = await listDumps(request(`${query}&page=2`));
		const firstBody = (await firstPage.json()) as {
			dumps: Array<Record<string, unknown>>;
			pagination: { total: number };
		};
		const secondBody = (await secondPage.json()) as {
			dumps: Array<Record<string, unknown>>;
		};
		const returnedIds = [...firstBody.dumps, ...secondBody.dumps]
			.map((dump) => dump.id)
			.filter((id): id is string => dumpIds.includes(id as string));

		expect(firstPage.status).toBe(200);
		expect(secondPage.status).toBe(200);
		expect(firstBody.pagination.total).toBe(3);
		expect(returnedIds).toEqual([...dumpIds].sort().reverse());
		expect(firstBody.dumps.every((dump) => !("content" in dump))).toBe(true);
	});

	it("combines text, type, tag, and source filters and supports empty results", async () => {
		const response = await listDumps(
			request(
				`q=${encodeURIComponent(namespace)}&type=solution&tag=database-setup&source=${encodeURIComponent("Shell history")}`,
			),
		);
		const body = (await response.json()) as { dumps: Array<{ id: string }> };
		const emptyResponse = await listDumps(request(`q=${namespace}-missing`));

		expect(response.status).toBe(200);
		expect(body.dumps.map((dump) => dump.id).sort()).toEqual(
			[dumpIds[0], dumpIds[2]].sort(),
		);
		expect(await emptyResponse.json()).toMatchObject({ dumps: [] });
	});

	it("returns detail content and clear 400 and 404 responses", async () => {
		const detailResponse = await getDump(request(), detailContext(dumpIds[0]!));
		const detail = (await detailResponse.json()) as {
			dump: Record<string, unknown>;
		};

		expect(detailResponse.status).toBe(200);
		expect(detail.dump).toMatchObject({
			id: dumpIds[0],
			title: "Prisma pagination",
		});
		expect(detail.dump.content).toContain(namespace);
		expect(detail.dump).not.toHaveProperty("chunks");
		expect((await listDumps(request("page=0"))).status).toBe(400);
		expect((await getDump(request(), detailContext(randomUUID()))).status).toBe(
			404,
		);
	});

	it("returns a 500 contract when the list dependency fails", async () => {
		const transaction = vi
			.spyOn(db, "$transaction")
			.mockRejectedValueOnce(new Error("database down"));

		const response = await listDumps(request());

		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to retrieve dumps",
			message: "database down",
		});
		transaction.mockRestore();
	});

	it("partially updates normalized metadata and preserves unspecified fields", async () => {
		const dump = await db.dump.create({
			data: {
				content: `${namespace} metadata mutation`,
				title: "Original title",
				type: "error",
				tags: ["original"],
				source: "Original source",
			},
		});
		dumpIds.push(dump.id);

		const response = await patchDump(
			mutationRequest("PATCH", {
				title: "  Updated title  ",
				tags: [" TypeScript ", "database setup", "typescript"],
			}),
			detailContext(dump.id),
		);
		const body = (await response.json()) as { dump: Record<string, unknown> };

		expect(response.status).toBe(200);
		expect(body.dump).toMatchObject({
			id: dump.id,
			content: `${namespace} metadata mutation`,
			title: "Updated title",
			type: "error",
			tags: ["typescript", "database-setup"],
			source: "Original source",
		});
		expect(await db.dump.findUnique({ where: { id: dump.id } })).toMatchObject({
			title: "Updated title",
			type: "error",
			tags: ["typescript", "database-setup"],
			source: "Original source",
		});
	});

	it("deletes the dump and its cascade-owned chunks and embeddings", async () => {
		const dump = await db.dump.create({
			data: { content: `${namespace} cascade mutation` },
		});
		const chunk = await db.chunk.create({
			data: { dumpId: dump.id, content: "cascade chunk", order: 0 },
		});
		await db.$executeRaw`
			INSERT INTO "Embedding" (id, "chunkId", vector, "createdAt")
			VALUES (${randomUUID()}, ${chunk.id}, ${`[${Array(768).fill(1).join(",")}]`}::vector, ${new Date()})
		`;

		const response = await deleteDump(
			mutationRequest("DELETE"),
			detailContext(dump.id),
		);

		expect(response.status).toBe(200);
		expect(await db.dump.findUnique({ where: { id: dump.id } })).toBeNull();
		expect(await db.chunk.findUnique({ where: { id: chunk.id } })).toBeNull();
		expect(
			await db.embedding.findUnique({ where: { chunkId: chunk.id } }),
		).toBeNull();
	});

	it("returns clear mutation 400, 404, and 500 contracts", async () => {
		expect(
			(
				await patchDump(
					mutationRequest("PATCH", { content: "not allowed" }),
					detailContext(randomUUID()),
				)
			).status,
		).toBe(400);
		expect(
			(await deleteDump(mutationRequest("DELETE"), detailContext(randomUUID())))
				.status,
		).toBe(404);

		const update = vi
			.spyOn(db.dump, "update")
			.mockRejectedValueOnce(new Error("database down"));
		const response = await patchDump(
			mutationRequest("PATCH", { title: "Updated" }),
			detailContext(randomUUID()),
		);
		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to update dump",
			message: "database down",
		});
		update.mockRestore();
	});
});
