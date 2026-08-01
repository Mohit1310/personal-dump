import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { db } from "@/server/db";

const EMBEDDING_DIMENSIONS = 768;
const mocks = vi.hoisted(() => ({
	chunkText: vi.fn((content: string) => content.split("\n---\n")),
	embedQuery: vi.fn((content: string) =>
		Promise.resolve(
			content === "bad-vector"
				? [1, 0]
				: Array.from({ length: 768 }, (_, index) =>
						index === content.length % 768 ? 1 : 0,
					),
		),
	),
}));
const initialMigrationPath = fileURLToPath(
	new URL(
		"../../prisma/migrations/20260201055629_starting_schema/migration.sql",
		import.meta.url,
	),
);
const metadataMigrationPath = fileURLToPath(
	new URL(
		"../../prisma/migrations/20260726000000_add_dump_metadata/migration.sql",
		import.meta.url,
	),
);

vi.mock("@/lib/processing/chunk-text", () => ({ chunkText: mocks.chunkText }));
vi.mock("@/lib/embeddings/embed-query", () => ({
	embedQuery: mocks.embedQuery,
}));

import { POST } from "@/app/api/dump/route";
import { MAX_DUMP_CONTENT_BYTES } from "@/lib/dump-content";

const request = (body: unknown) =>
	new Request("http://localhost/api/dump", {
		method: "POST",
		body: JSON.stringify(body),
		headers: { "content-type": "application/json" },
	});

describe("dump metadata migration", () => {
	const pool = new pg.Pool({
		connectionString: process.env.TEST_DATABASE_URL,
	});
	const schemaName = `dump_metadata_${randomUUID().replaceAll("-", "")}`;
	let client: pg.PoolClient;

	beforeAll(async () => {
		client = await pool.connect();
		await client.query(`CREATE SCHEMA "${schemaName}"`);
		await client.query(`SET search_path TO "${schemaName}", public`);
		await client.query(await readFile(initialMigrationPath, "utf8"));
		await client.query(
			`INSERT INTO "Dump" ("id", "content", "createdAt")
			 VALUES ($1, $2, $3)`,
			["legacy-dump", "legacy content", new Date("2025-01-02T03:04:05Z")],
		);
		await client.query(await readFile(metadataMigrationPath, "utf8"));
	});

	afterAll(async () => {
		await client.query("SET search_path TO public");
		await client.query(`DROP SCHEMA "${schemaName}" CASCADE`);
		client.release();
		await pool.end();
	});

	it("backfills existing dumps without changing their content", async () => {
		const result = await client.query(
			`SELECT "content", "title", "type", "tags", "source", "createdAt", "updatedAt"
			 FROM "Dump" WHERE "id" = $1`,
			["legacy-dump"],
		);

		expect(result.rows[0]).toMatchObject({
			content: "legacy content",
			title: "",
			type: "note",
			tags: [],
			source: "",
		});
		expect(result.rows[0].updatedAt).toEqual(result.rows[0].createdAt);
	});

	it("applies backward-compatible database defaults to content-only inserts", async () => {
		await client.query(`INSERT INTO "Dump" ("id", "content") VALUES ($1, $2)`, [
			"content-only",
			"new content",
		]);
		const result = await client.query(
			`SELECT "title", "type", "tags", "source", "updatedAt"
			 FROM "Dump" WHERE "id" = $1`,
			["content-only"],
		);

		expect(result.rows[0]).toMatchObject({
			title: "",
			type: "note",
			tags: [],
			source: "",
		});
		expect(result.rows[0].updatedAt).toBeInstanceOf(Date);
	});
});

describe("POST /api/dump metadata persistence", () => {
	const dumpIds: string[] = [];

	afterEach(async () => {
		await db.dump.deleteMany({ where: { id: { in: dumpIds.splice(0) } } });
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("stores normalized metadata with ordered chunks and embeddings", async () => {
		const response = await POST(
			request({
				content: "first chunk\n---\nsecond chunk",
				title: "  Database note  ",
				type: "error",
				tags: [" PostgreSQL ", "PG Vector", "postgresql"],
				source: "  shell  ",
			}),
		);
		const body = (await response.json()) as {
			chunksCreated: number;
			dumpId: string;
		};
		dumpIds.push(body.dumpId);
		const chunks = await db.$queryRaw<
			Array<{ content: string; dimensions: number; order: number }>
		>`
			SELECT c.content, c."order", vector_dims(e.vector) AS dimensions
			FROM "Chunk" c
			JOIN "Embedding" e ON e."chunkId" = c.id
			WHERE c."dumpId" = ${body.dumpId}
			ORDER BY c."order" ASC
		`;

		expect(response.status).toBe(200);
		expect(body).toMatchObject({ chunksCreated: 2 });
		expect(
			await db.dump.findUnique({ where: { id: body.dumpId } }),
		).toMatchObject({
			content: "first chunk\n---\nsecond chunk",
			title: "Database note",
			type: "error",
			tags: ["postgresql", "pg-vector"],
			source: "shell",
		});
		expect(chunks).toEqual([
			{
				content: "first chunk",
				dimensions: EMBEDDING_DIMENSIONS,
				order: 0,
			},
			{
				content: "second chunk",
				dimensions: EMBEDDING_DIMENSIONS,
				order: 1,
			},
		]);
		expect(mocks.embedQuery).toHaveBeenCalledTimes(2);
	});

	it("keeps content-only clients backward compatible", async () => {
		const response = await POST(request({ content: "Content only" }));
		const body = (await response.json()) as { dumpId: string };
		dumpIds.push(body.dumpId);

		expect(response.status).toBe(200);
		expect(
			await db.dump.findUnique({ where: { id: body.dumpId } }),
		).toMatchObject({
			content: "Content only",
			title: "",
			type: "note",
			tags: [],
			source: "",
		});
	});

	it("rejects oversized UTF-8 content before provider or database work", async () => {
		const before = await db.dump.count();
		const response = await POST(
			request({
				content: "😀".repeat(Math.floor(MAX_DUMP_CONTENT_BYTES / 4) + 1),
			}),
		);

		expect(response.status).toBe(413);
		expect(await response.json()).toEqual({ error: "Content too large" });
		expect(mocks.chunkText).not.toHaveBeenCalled();
		expect(mocks.embedQuery).not.toHaveBeenCalled();
		expect(await db.dump.count()).toBe(before);
	});

	it("rolls back all records when an embedding cannot be persisted", async () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		const before = {
			dumps: await db.dump.count(),
			chunks: await db.chunk.count(),
			embeddings: await db.embedding.count(),
		};

		const response = await POST(
			request({ content: "valid chunk\n---\nbad-vector" }),
		);

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: "Failed to store dump" });
		expect(mocks.embedQuery).toHaveBeenCalledTimes(2);
		expect(String(consoleError.mock.calls[0]?.[1])).toContain(
			"expected 768 dimensions, not 2",
		);
		expect({
			dumps: await db.dump.count(),
			chunks: await db.chunk.count(),
			embeddings: await db.embedding.count(),
		}).toEqual(before);
	});
});
