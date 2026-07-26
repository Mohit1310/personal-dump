import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	embedQuery: vi.fn(),
	vectorSearch: vi.fn(),
	generateAnswer: vi.fn(),
}));
vi.mock("@/lib/embeddings/embed-query", () => ({
	embedQuery: mocks.embedQuery,
}));
vi.mock("@/lib/retrieval/vector-search", () => ({
	vectorSearch: mocks.vectorSearch,
}));
vi.mock("@/lib/rag/generate-answer", () => ({
	generateAnswer: mocks.generateAnswer,
}));

import { POST } from "./route";

const request = (body: unknown) =>
	new Request("http://localhost/api/search", {
		method: "POST",
		body: typeof body === "string" ? body : JSON.stringify(body),
		headers: { "content-type": "application/json" },
	});
const results = [{ id: "chunk-1", content: "answer source", distance: 0.1 }];

describe("POST /api/search", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.embedQuery.mockResolvedValue([1, 2]);
		mocks.vectorSearch.mockResolvedValue(results);
		mocks.generateAnswer.mockResolvedValue("formatted answer");
	});
	it.each([undefined, null, "", "   ", 42])(
		"rejects invalid query %j",
		async (query) => expect((await POST(request({ query }))).status).toBe(400),
	);
	it("rejects invalid topK and malformed JSON", async () => {
		expect((await POST(request({ query: "q", topK: 0 }))).status).toBe(400);
		expect((await POST(request({ query: "q", topK: "8" }))).status).toBe(400);
		expect((await POST(request("{"))).status).toBe(400);
	});
	it.each([
		{ type: "memo" },
		{ tag: "" },
		{ tag: "x".repeat(51) },
		{ source: "" },
		{ source: "x".repeat(501) },
		{ extra: "value" },
	])("rejects invalid filters %j", async (filters) => {
		expect((await POST(request({ query: "q", filters }))).status).toBe(400);
	});
	it("defaults topK and returns answer and sources", async () => {
		const response = await POST(request({ query: "q" }));
		expect(await response.json()).toEqual({
			answer: "formatted answer",
			sources: results,
		});
		expect(mocks.embedQuery).toHaveBeenCalledWith("q");
		expect(mocks.vectorSearch).toHaveBeenCalledWith([1, 2], 8, undefined);
		expect(mocks.generateAnswer).toHaveBeenCalledWith({
			userQuery: "q",
			chunks: results,
		});
	});
	it("passes normalized filters and supports no results", async () => {
		mocks.vectorSearch.mockResolvedValue([]);
		mocks.generateAnswer.mockResolvedValue("no results");
		const response = await POST(
			request({
				query: "q",
				topK: 3,
				filters: {
					type: "solution",
					tag: " Database Setup ",
					source: " Shell history ",
				},
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			answer: "no results",
			sources: [],
		});
		expect(mocks.vectorSearch).toHaveBeenCalledWith([1, 2], 3, {
			type: "solution",
			tag: "database-setup",
			source: "Shell history",
		});
	});
	it.each(["embedQuery", "vectorSearch", "generateAnswer"])(
		"returns 500 when %s fails",
		async (dependency) => {
			mocks[dependency as keyof typeof mocks].mockRejectedValueOnce(
				new Error("dependency down"),
			);
			const response = await POST(request({ query: "q" }));
			expect(response.status).toBe(500);
			expect(await response.json()).toMatchObject({
				error: "Search failed",
				message: "dependency down",
			});
		},
	);
});
