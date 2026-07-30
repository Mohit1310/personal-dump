import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	chunkText: vi.fn(),
	embedQuery: vi.fn(),
	dumpCreate: vi.fn(),
	chunkCreate: vi.fn(),
	executeRaw: vi.fn(),
	transaction: vi.fn(),
}));

vi.mock("@/lib/processing/chunk-text", () => ({ chunkText: mocks.chunkText }));
vi.mock("@/lib/embeddings/embed-query", () => ({
	embedQuery: mocks.embedQuery,
}));
vi.mock("@/server/db", () => ({
	db: {
		dump: { create: mocks.dumpCreate },
		chunk: { create: mocks.chunkCreate },
		$executeRaw: mocks.executeRaw,
		$transaction: mocks.transaction,
	},
}));

import {
	dumpContentSchema,
	MAX_DUMP_CONTENT_BYTES,
} from "@/lib/dump-content";
import { POST } from "./route";

const request = (body: unknown) =>
	new Request("http://localhost/api/dump", {
		method: "POST",
		body: typeof body === "string" ? body : JSON.stringify(body),
		headers: { "content-type": "application/json" },
	});

describe("POST /api/dump", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.dumpCreate.mockResolvedValue({ id: "dump-1" });
		mocks.chunkCreate.mockImplementation(
			({ data }: { data: { order: number; content: string } }) =>
				Promise.resolve({ id: `chunk-${data.order}`, ...data }),
		);
		mocks.chunkText.mockReturnValue(["first", "second"]);
		mocks.embedQuery.mockImplementation((content: string) =>
			Promise.resolve(content === "first" ? [1, 2] : [3, 4]),
		);
		mocks.executeRaw.mockResolvedValue(1);
		mocks.transaction.mockImplementation((callback: (tx: object) => unknown) =>
			callback({
				dump: { create: mocks.dumpCreate },
				chunk: { create: mocks.chunkCreate },
				$executeRaw: mocks.executeRaw,
			}),
		);
	});

	it.each([undefined, null, "", "   ", 42])(
		"rejects invalid content %j",
		async (content) => {
			const response = await POST(request({ content }));
			expect(response.status).toBe(400);
			expect(mocks.dumpCreate).not.toHaveBeenCalled();
		},
	);
	it("enforces the content limit by UTF-8 byte length", () => {
		expect(
			dumpContentSchema.safeParse("a".repeat(MAX_DUMP_CONTENT_BYTES)).success,
		).toBe(true);
		expect(
			dumpContentSchema.safeParse("a".repeat(MAX_DUMP_CONTENT_BYTES + 1))
				.success,
		).toBe(false);
		expect(
			dumpContentSchema.safeParse(
				"😀".repeat(Math.floor(MAX_DUMP_CONTENT_BYTES / 4) + 1),
			).success,
		).toBe(false);
	});
	it("accepts content at the byte limit", async () => {
		const content = "a".repeat(MAX_DUMP_CONTENT_BYTES);

		const response = await POST(request({ content }));

		expect(response.status).toBe(200);
		expect(mocks.chunkText).toHaveBeenCalledWith(content);
	});
	it("rejects oversized content before chunking, embedding, or database writes", async () => {
		const content = "😀".repeat(
			Math.floor(MAX_DUMP_CONTENT_BYTES / 4) + 1,
		);

		const response = await POST(request({ content }));

		expect(response.status).toBe(413);
		expect(await response.json()).toEqual({ error: "Content too large" });
		expect(mocks.chunkText).not.toHaveBeenCalled();
		expect(mocks.embedQuery).not.toHaveBeenCalled();
		expect(mocks.transaction).not.toHaveBeenCalled();
		expect(mocks.dumpCreate).not.toHaveBeenCalled();
		expect(mocks.chunkCreate).not.toHaveBeenCalled();
		expect(mocks.executeRaw).not.toHaveBeenCalled();
	});
	it("rejects invalid type and malformed JSON", async () => {
		expect((await POST(request({ content: "ok", type: "other" }))).status).toBe(
			400,
		);
		expect((await POST(request("{"))).status).toBe(400);
	});
	it.each([
		{ title: null },
		{ title: "t".repeat(201) },
		{ source: 42 },
		{ source: "s".repeat(501) },
		{ tags: "typescript" },
		{ tags: Array.from({ length: 21 }, (_, index) => `tag-${index}`) },
		{ tags: [""] },
		{ tags: ["t".repeat(51)] },
	])("rejects invalid or excessive metadata %j", async (metadata) => {
		const response = await POST(request({ content: "ok", ...metadata }));

		expect(response.status).toBe(400);
		expect(mocks.dumpCreate).not.toHaveBeenCalled();
	});
	it("preserves original content formatting", async () => {
		const content = "  code snippet\n  ";
		const response = await POST(request({ content }));

		expect(response.status).toBe(200);
		expect(mocks.dumpCreate).toHaveBeenCalledWith({
			data: {
				content,
				source: "",
				tags: [],
				title: "",
				type: "note",
			},
		});
		expect(mocks.chunkText).toHaveBeenCalledWith(content);
	});
	it("normalizes and persists supplied metadata", async () => {
		const response = await POST(
			request({
				content: "Metadata example",
				title: "  Prisma fix  ",
				type: "solution",
				tags: [" TypeScript ", "database setup", "typescript"],
				source: "  terminal history  ",
			}),
		);

		expect(response.status).toBe(200);
		expect(mocks.dumpCreate).toHaveBeenCalledWith({
			data: {
				content: "Metadata example",
				title: "Prisma fix",
				type: "solution",
				tags: ["typescript", "database-setup"],
				source: "terminal history",
			},
		});
	});
	it("ingests ordered chunks with one embedding and write per chunk", async () => {
		const response = await POST(
			request({ content: "original", type: "error" }),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			success: true,
			dumpId: "dump-1",
			chunksCreated: 2,
		});
		expect(
			mocks.chunkCreate.mock.calls.map(([arg]) => arg.data.order).sort(),
		).toEqual([0, 1]);
		expect(
			mocks.chunkCreate.mock.calls.map(([arg]) => arg.data.content).sort(),
		).toEqual(["first", "second"]);
		expect(mocks.embedQuery).toHaveBeenCalledTimes(2);
		expect(mocks.executeRaw).toHaveBeenCalledTimes(2);
	});
	it("returns 500 without database writes when embedding generation fails", async () => {
		mocks.embedQuery.mockRejectedValueOnce(new Error("provider down"));
		const response = await POST(request({ content: "original" }));
		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({ error: "Failed to store dump" });
		expect(mocks.transaction).not.toHaveBeenCalled();
		expect(mocks.dumpCreate).not.toHaveBeenCalled();
		expect(mocks.chunkCreate).not.toHaveBeenCalled();
		expect(mocks.executeRaw).not.toHaveBeenCalled();
	});
});
