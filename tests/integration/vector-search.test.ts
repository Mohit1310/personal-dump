import { randomUUID } from "node:crypto";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
} from "vitest";
import { db } from "@/server/db";
import { vectorSearch } from "@/lib/retrieval/vector-search";

const vector = (index: number, value = 1) =>
	Array.from({ length: 768 }, (_, dimension) =>
		dimension === index ? value : 0,
	);
const vectorText = (values: number[]) => `[${values.join(",")}]`;

async function seedChunk(
	dumpId: string,
	content: string,
	values: number[],
	order: number,
) {
	const chunkId = randomUUID();
	await db.$executeRawUnsafe(
		`INSERT INTO "Chunk" ("id", "dumpId", "content", "order") VALUES ($1, $2, $3, $4)`,
		chunkId,
		dumpId,
		content,
		order,
	);
	await db.$executeRawUnsafe(
		`INSERT INTO "Embedding" ("id", "chunkId", "vector") VALUES ($1, $2, $3::vector)`,
		randomUUID(),
		chunkId,
		vectorText(values),
	);
	return chunkId;
}

describe("vectorSearch against PostgreSQL and pgvector", () => {
	let dumpIds: string[] = [];

	beforeAll(async () => {
		await db.$queryRaw`SELECT 1`;
	});

	beforeEach(async () => {
		dumpIds = [randomUUID(), randomUUID()];
		await db.$executeRawUnsafe(
			`INSERT INTO "Dump" ("id", "content") VALUES ($1, $2), ($3, $4)`,
			dumpIds[0],
			"first dump",
			dumpIds[1],
			"second dump",
		);
	});

	afterEach(async () => {
		await db.$executeRawUnsafe(
			`DELETE FROM "Dump" WHERE "id" = ANY($1::text[])`,
			dumpIds,
		);
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("ranks by cosine distance, honors topK, and returns ids/content", async () => {
		const nearestId = await seedChunk(dumpIds[0]!, "nearest", vector(0), 0);
		await seedChunk(dumpIds[0]!, "farther", vector(1), 1);

		const results = await vectorSearch(vector(0), 1);

		expect(results).toHaveLength(1);
		expect(results[0]).toMatchObject({ id: nearestId, content: "nearest" });
		expect(results[0]!.distance).toBeCloseTo(0);
	});

	it("searches semantically across dumps", async () => {
		await seedChunk(dumpIds[0]!, "included", vector(0), 0);
		await seedChunk(dumpIds[1]!, "also semantically nearest", vector(0), 0);

		const results = await vectorSearch(vector(0));

		expect(results.map(({ content }) => content).sort()).toEqual([
			"also semantically nearest",
			"included",
		]);
	});

	it("returns an empty list when there are no embeddings", async () => {
		expect(await vectorSearch(vector(2))).toEqual([]);
	});

	it("returns a stable acceptable set for tied distances", async () => {
		await seedChunk(dumpIds[0]!, "tie one", vector(3), 0);
		await seedChunk(dumpIds[0]!, "tie two", vector(4), 1);

		const results = await vectorSearch(vector(5), 2);

		expect(new Set(results.map(({ content }) => content))).toEqual(
			new Set(["tie one", "tie two"]),
		);
	});

	it("translates database errors", async () => {
		await expect(vectorSearch(vector(0), -1)).rejects.toThrow(
			"Failed to perform vector search",
		);
	});

	it("rejects vectors with the wrong dimension in PostgreSQL", async () => {
		const chunkId = randomUUID();
		await db.$executeRawUnsafe(
			`INSERT INTO "Chunk" ("id", "dumpId", "content", "order") VALUES ($1, $2, $3, $4)`,
			chunkId,
			dumpIds[0],
			"wrong dimension",
			0,
		);
		await expect(
			db.$executeRawUnsafe(
				`INSERT INTO "Embedding" ("id", "chunkId", "vector") VALUES ($1, $2, $3::vector)`,
				randomUUID(),
				chunkId,
				vectorText([1, 0]),
			),
		).rejects.toThrow();
	});

	it("rolls back all dump records when an embedding write fails", async () => {
		const dumpId = randomUUID();
		const chunkId = randomUUID();

		await expect(
			db.$transaction(async (tx) => {
				await tx.dump.create({ data: { id: dumpId, content: "atomic dump" } });
				await tx.chunk.create({
					data: {
						id: chunkId,
						dumpId,
						content: "atomic chunk",
						order: 0,
					},
				});
				await tx.$executeRaw`
					INSERT INTO "Embedding" (id, "chunkId", vector)
					VALUES (${randomUUID()}, ${chunkId}, ${vectorText([1, 0])}::vector)
				`;
			}),
		).rejects.toThrow();

		expect(await db.dump.count({ where: { id: dumpId } })).toBe(0);
		expect(await db.chunk.count({ where: { id: chunkId } })).toBe(0);
		expect(await db.embedding.count({ where: { chunkId } })).toBe(0);
	});
});
