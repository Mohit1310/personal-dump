import { randomUUID } from "node:crypto";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { db } from "@/server/db";

const mocks = vi.hoisted(() => ({
	embedQuery: vi.fn(async (content: string) => {
		if (content === "provider-failure") {
			throw new Error("provider down");
		}
		if (content === "bad-vector") {
			return [1, 0];
		}

		return Array.from({ length: 768 }, (_, index) =>
			index === content.length % 768 ? 1 : 0,
		);
	}),
}));

vi.mock("@/lib/processing/chunk-text", () => ({
	chunkText: (content: string) => content.split("\n---\n"),
}));
vi.mock("@/lib/embeddings/embed-query", () => ({
	embedQuery: mocks.embedQuery,
}));

import { PUT } from "@/app/api/dumps/[id]/route";

const request = (body: unknown) =>
	new Request("http://localhost/api/dumps/example", {
		method: "PUT",
		body: JSON.stringify(body),
		headers: { "content-type": "application/json" },
	});
const context = (id: string) => ({ params: Promise.resolve({ id }) });
const vector = (dimension: number) =>
	Array.from({ length: 768 }, (_, index) => (index === dimension ? 1 : 0));
const vectorText = (values: number[]) => `[${values.join(",")}]`;

type DerivedRecord = {
	chunkId: string;
	content: string;
	order: number;
	embeddingId: string;
	dimensions: number;
};

async function seedIndexedDump(content = "original content") {
	const dump = await db.dump.create({ data: { content } });

	for (const [order, chunkContent] of ["old first", "old second"].entries()) {
		const chunk = await db.chunk.create({
			data: {
				dumpId: dump.id,
				content: chunkContent,
				order,
			},
		});
		await db.$executeRaw`
			INSERT INTO "Embedding" (id, "chunkId", vector)
			VALUES (${randomUUID()}, ${chunk.id}, ${vectorText(vector(order))}::vector)
		`;
	}

	return dump.id;
}

async function readState(id: string) {
	const dump = await db.dump.findUnique({
		where: { id },
		select: { content: true },
	});
	const derived = await db.$queryRaw<DerivedRecord[]>`
		SELECT
			c.id AS "chunkId",
			c.content,
			c."order",
			e.id AS "embeddingId",
			vector_dims(e.vector) AS dimensions
		FROM "Chunk" c
		JOIN "Embedding" e ON e."chunkId" = c.id
		WHERE c."dumpId" = ${id}
		ORDER BY c."order" ASC
	`;

	return { dump, derived };
}

describe("PUT /api/dumps/[id] content replacement against PostgreSQL", () => {
	const dumpIds: string[] = [];

	afterEach(async () => {
		await db.dump.deleteMany({ where: { id: { in: dumpIds.splice(0) } } });
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it.each([
		["missing", {}],
		["empty", { content: "" }],
		["blank", { content: "   " }],
	])(
		"rejects %s content without changing stored records",
		async (_case, body) => {
			const id = await seedIndexedDump();
			dumpIds.push(id);
			const before = await readState(id);

			const response = await PUT(request(body), context(id));

			expect(response.status).toBe(400);
			expect(await readState(id)).toEqual(before);
		},
	);

	it("returns 404 for a missing dump without calling the provider", async () => {
		const response = await PUT(
			request({ content: "replacement" }),
			context(randomUUID()),
		);

		expect(response.status).toBe(404);
		expect(mocks.embedQuery).not.toHaveBeenCalled();
	});

	it("replaces old records with a complete ordered 768-dimensional index", async () => {
		const id = await seedIndexedDump();
		dumpIds.push(id);
		const before = await readState(id);

		const response = await PUT(
			request({ content: "new first\n---\nnew second\n---\nnew third" }),
			context(id),
		);
		const after = await readState(id);

		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			success: true,
			chunksCreated: 3,
			dump: { id, content: "new first\n---\nnew second\n---\nnew third" },
		});
		expect(after.dump).toEqual({
			content: "new first\n---\nnew second\n---\nnew third",
		});
		expect(
			after.derived.map(({ content, dimensions, order }) => ({
				content,
				dimensions,
				order,
			})),
		).toEqual([
			{ content: "new first", dimensions: 768, order: 0 },
			{ content: "new second", dimensions: 768, order: 1 },
			{ content: "new third", dimensions: 768, order: 2 },
		]);
		expect(after.derived.map(({ chunkId }) => chunkId)).not.toEqual(
			expect.arrayContaining(before.derived.map(({ chunkId }) => chunkId)),
		);
		expect(
			await db.chunk.count({
				where: {
					id: { in: before.derived.map(({ chunkId }) => chunkId) },
				},
			}),
		).toBe(0);
		expect(
			await db.embedding.count({
				where: {
					id: { in: before.derived.map(({ embeddingId }) => embeddingId) },
				},
			}),
		).toBe(0);
	});

	it("preserves the original dump and index when the provider fails", async () => {
		const id = await seedIndexedDump();
		dumpIds.push(id);
		const before = await readState(id);

		const response = await PUT(
			request({ content: "new first\n---\nprovider-failure" }),
			context(id),
		);

		expect(response.status).toBe(500);
		expect(await readState(id)).toEqual(before);
	});

	it("rolls back content, deletion, and partial inserts on a vector write failure", async () => {
		const id = await seedIndexedDump();
		dumpIds.push(id);
		const before = await readState(id);

		const response = await PUT(
			request({ content: "new first\n---\nbad-vector" }),
			context(id),
		);

		expect(response.status).toBe(500);
		expect(await readState(id)).toEqual(before);
	});
});
