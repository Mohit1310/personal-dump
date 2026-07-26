import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { db } from "@/server/db";

const EMBEDDING_DIMENSIONS = 768;
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

vi.mock("@/lib/processing/chunk-text", () => ({
	chunkText: (content: string) => [content],
}));
vi.mock("@/lib/embeddings/embed-query", () => ({
	embedQuery: () =>
		Promise.resolve([
			1,
			...Array.from({ length: EMBEDDING_DIMENSIONS - 1 }, () => 0),
		]),
}));

import { POST } from "@/app/api/dump/route";

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

	afterAll(async () => {
		await db.dump.deleteMany({ where: { id: { in: dumpIds } } });
		await db.$disconnect();
	});

	it("stores normalized metadata in PostgreSQL", async () => {
		const response = await POST(
			request({
				content: "Persist metadata",
				title: "  Database note  ",
				type: "error",
				tags: [" PostgreSQL ", "PG Vector", "postgresql"],
				source: "  shell  ",
			}),
		);
		const body = (await response.json()) as { dumpId: string };
		dumpIds.push(body.dumpId);

		expect(response.status).toBe(200);
		expect(
			await db.dump.findUnique({ where: { id: body.dumpId } }),
		).toMatchObject({
			content: "Persist metadata",
			title: "Database note",
			type: "error",
			tags: ["postgresql", "pg-vector"],
			source: "shell",
		});
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
});
