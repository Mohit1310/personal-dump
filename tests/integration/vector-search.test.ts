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
import {
	corpus,
	currentVectorBaseline,
	currentVectorBaselineMetrics,
	EVAL_TOP_K,
	evaluateCorpus,
	metadataScopedVectorBaseline,
	metadataScopedVectorMetrics,
} from "../evals/schema";

const expandVector = (values: number[]) =>
	Array.from({ length: 768 }, (_, dimension) =>
		dimension < values.length ? values[dimension]! : 0,
	);
const vector = (index: number, value = 1) =>
	expandVector(
		Array.from({ length: index + 1 }, (_, i) => (i === index ? value : 0)),
	);
const vectorText = (values: number[]) => `[${values.join(",")}]`;

async function seedChunk(
	dumpId: string,
	content: string,
	values: number[],
	order: number,
	chunkId: string = randomUUID(),
) {
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
		await db.dump.createMany({
			data: [
				{
					id: dumpIds[0],
					content: "first dump",
					type: "solution",
					tags: ["database", "shared"],
					source: "Runbook",
				},
				{
					id: dumpIds[1],
					content: "second dump",
					type: "error",
					tags: ["frontend", "shared"],
					source: "Browser console",
				},
			],
		});
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

	it.each([
		["type", { type: "solution" as const }, ["first"]],
		["tag", { tag: "frontend" }, ["second"]],
		["source", { source: "runbook" }, ["first"]],
	])(
		"applies the %s filter before returning results",
		async (_, filters, expected) => {
			await seedChunk(dumpIds[0]!, "first", vector(0), 0);
			await seedChunk(dumpIds[1]!, "second", vector(0), 0);

			const results = await vectorSearch(vector(0), 8, filters);

			expect(results.map(({ content }) => content)).toEqual(expected);
		},
	);

	it("combines filters and returns an empty list for a mismatched scope", async () => {
		await seedChunk(dumpIds[0]!, "matching", vector(0), 0);
		await seedChunk(dumpIds[1]!, "excluded", vector(0), 0);

		expect(
			await vectorSearch(vector(0), 8, {
				type: "solution",
				tag: "database",
				source: "RUNBOOK",
			}),
		).toEqual([
			expect.objectContaining({
				content: "matching",
			}),
		]);
		expect(
			await vectorSearch(vector(0), 8, {
				type: "solution",
				tag: "frontend",
			}),
		).toEqual([]);
	});

	it("filters before ranking and limiting", async () => {
		await seedChunk(dumpIds[1]!, "nearest but excluded", vector(0), 0);
		await seedChunk(dumpIds[0]!, "farther but scoped", vector(1), 0);

		const results = await vectorSearch(vector(0), 1, {
			type: "solution",
		});

		expect(results).toEqual([
			expect.objectContaining({ content: "farther but scoped" }),
		]);
	});

	it("returns an empty list when there are no embeddings", async () => {
		expect(await vectorSearch(vector(2))).toEqual([]);
	});

	it("returns a stable acceptable set for tied distances", async () => {
		await seedChunk(dumpIds[0]!, "tie two", vector(3), 0, "scope-tie-b");
		await seedChunk(dumpIds[0]!, "tie one", vector(4), 1, "scope-tie-a");

		const results = await vectorSearch(vector(5), 2);

		expect(results.map(({ content }) => content)).toEqual([
			"tie one",
			"tie two",
		]);
	});

	it("matches the deterministic metadata-scoped evaluation cases", async () => {
		for (const chunk of corpus.chunks) {
			const dumpId = `scoped-eval-dump-${chunk.id}`;
			dumpIds.push(dumpId);
			await db.dump.create({
				data: {
					id: dumpId,
					content: chunk.content,
					title: chunk.id,
					...chunk.metadata,
				},
			});
			await seedChunk(
				dumpId,
				chunk.content,
				expandVector(chunk.embedding),
				0,
				chunk.id,
			);
		}

		const rankings = { ...currentVectorBaseline };
		for (const item of corpus.cases.filter(({ scope }) => scope)) {
			rankings[item.id] = (
				await vectorSearch(
					expandVector(item.queryEmbedding),
					EVAL_TOP_K,
					item.scope,
				)
			).map(({ id }) => id);
		}

		const scopedRankings = Object.fromEntries(
			Object.keys(metadataScopedVectorBaseline).map((id) => [id, rankings[id]]),
		);
		expect(scopedRankings).toEqual(metadataScopedVectorBaseline);
		expect(evaluateCorpus(corpus, rankings, EVAL_TOP_K).metrics).toEqual(
			metadataScopedVectorMetrics,
		);
	});

	it("matches the frozen deterministic RAG evaluation baseline", async () => {
		for (const chunk of corpus.chunks) {
			const dumpId = `eval-dump-${chunk.id}`;
			dumpIds.push(dumpId);
			await db.dump.create({
				data: {
					id: dumpId,
					content: chunk.content,
					title: chunk.id,
					...chunk.metadata,
				},
			});
			await seedChunk(
				dumpId,
				chunk.content,
				expandVector(chunk.embedding),
				0,
				chunk.id,
			);
		}

		const rankings: Record<string, string[]> = {};
		for (const item of corpus.cases) {
			rankings[item.id] = (
				await vectorSearch(expandVector(item.queryEmbedding), EVAL_TOP_K)
			).map(({ id }) => id);
		}

		const report = evaluateCorpus(corpus, rankings, EVAL_TOP_K);
		expect(
			rankings,
			`Current pgvector rankings changed:\n${JSON.stringify(rankings, null, 2)}`,
		).toEqual(currentVectorBaseline);
		expect(
			report.metrics,
			`Metric failures:\n${report.failures.join("\n")}`,
		).toEqual(currentVectorBaselineMetrics);
	});

	it("translates database errors", async () => {
		await expect(vectorSearch(vector(0), -1)).rejects.toThrow(
			"Failed to perform vector search",
		);
	});

	it.each([
		{ type: "memo" },
		{ tag: "" },
		{ tag: "x".repeat(51) },
		{ source: "" },
		{ source: "x".repeat(501) },
	])("rejects invalid filter input %j", async (filters) => {
		await expect(vectorSearch(vector(0), 8, filters as never)).rejects.toThrow(
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
