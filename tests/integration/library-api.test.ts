import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { GET as getDump } from "@/app/api/dumps/[id]/route";
import { GET as listDumps } from "@/app/api/dumps/route";
import { db } from "@/server/db";

const request = (query = "") =>
	new Request(`http://localhost/api/dumps${query ? `?${query}` : ""}`);
const detailContext = (id: string) => ({ params: Promise.resolve({ id }) });

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
});
