import { beforeEach, describe, expect, it, vi } from "vitest";

type SearchResult = { id: string; content: string; distance: number };
type StreamValue = Record<string, unknown>;

const mocks = vi.hoisted(() => ({
	convertToModelMessages: vi.fn(),
	createGroq: vi.fn(),
	createUIMessageStream: vi.fn(),
	createUIMessageStreamResponse: vi.fn(),
	streamText: vi.fn(),
	embedQuery: vi.fn(),
	getGroqModelIds: vi.fn(),
	hybridSearch: vi.fn(),
	modelFactory: vi.fn(),
	streamTextArgs: [] as Array<Record<string, unknown>>,
}));

vi.mock("@ai-sdk/groq", () => ({ createGroq: () => mocks.modelFactory }));
vi.mock("@/env", () => ({
	env: { GROQ_API_KEY: "test", GEMINI_API_KEY: "test" },
}));
vi.mock("@/lib/embeddings/embed-query", () => ({
	embedQuery: mocks.embedQuery,
}));
vi.mock("@/lib/models/groq-models", () => ({
	DEFAULT_GROQ_MODEL: "fallback-model",
	getGroqModelIds: mocks.getGroqModelIds,
}));
vi.mock("@/lib/retrieval/vector-search", () => ({
	DEFAULT_RETRIEVAL_TOP_K: 8,
	hybridSearch: mocks.hybridSearch,
}));
vi.mock("ai", () => ({
	convertToModelMessages: mocks.convertToModelMessages,
	createUIMessageStream: mocks.createUIMessageStream,
	createUIMessageStreamResponse: mocks.createUIMessageStreamResponse,
	streamText: mocks.streamText,
}));

import { POST } from "./route";

const chunks: SearchResult[] = [
	{ id: "chunk-1", content: "latest question: use pnpm test.", distance: 0.2 },
	{
		id: "chunk-2",
		content: "latest question: use pnpm typecheck.",
		distance: 0.4,
	},
];

function request(body: unknown): Request {
	return new Request("http://localhost/api/chat", {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
}

function setupStream(): void {
	mocks.convertToModelMessages.mockResolvedValue([]);
	mocks.modelFactory.mockReturnValue("selected-model");
	mocks.streamText.mockImplementation((args: Record<string, unknown>) => {
		mocks.streamTextArgs.push(args);
		return {
			toUIMessageStream: () => ({
				getReader: () => {
					let read = false;
					return {
						read: async () => {
							if (read) return { done: true, value: undefined };
							read = true;
							return {
								done: false,
								value: { type: "text-delta", delta: "answer" },
							};
						},
					};
				},
			}),
		};
	});
	mocks.createUIMessageStream.mockImplementation(
		({
			execute,
		}: {
			execute: (args: {
				writer: { write: (value: StreamValue) => void };
			}) => Promise<void>;
		}) => {
			const values: StreamValue[] = [];
			const stream = new ReadableStream({
				start(controller) {
					void execute({
						writer: { write: (value) => values.push(value) },
					}).then(
						() => {
							controller.enqueue(
								new TextEncoder().encode(JSON.stringify(values)),
							);
							controller.close();
						},
						(error) => controller.error(error),
					);
				},
			});
			return stream;
		},
	);
	mocks.createUIMessageStreamResponse.mockImplementation(
		({ stream }: { stream: ReadableStream }) => new Response(stream),
	);
}

async function responsePayload(body: unknown): Promise<StreamValue[]> {
	const response = await POST(request(body));
	return JSON.parse(await response.text()) as StreamValue[];
}

function latestStreamTextArgs(): Record<string, unknown> {
	const args = mocks.streamTextArgs.at(-1);
	if (!args) {
		throw new Error("streamText was not called");
	}
	return args;
}

describe("POST /api/chat", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.streamTextArgs.length = 0;
		mocks.getGroqModelIds.mockResolvedValue(["model-a", "model-b"]);
		mocks.embedQuery.mockResolvedValue([1, 2, 3]);
		mocks.hybridSearch.mockResolvedValue(chunks);
		setupStream();
	});

	it("rejects an invalid request body", async () => {
		const response = await POST(request({ messages: "not-an-array" }));
		expect(response.status).toBe(400);
		expect(await response.json()).toMatchObject({ error: "Invalid input" });
	});

	it("extracts the last user message, forwards normalized scope once, and streams sources", async () => {
		const payload = await responsePayload({
			model: "model-b",
			filters: {
				type: "solution",
				tag: " Database Setup ",
				source: " Shell history ",
			},
			messages: [
				{ role: "user", parts: [{ type: "text", text: "old" }] },
				{ role: "assistant", parts: [{ type: "text", text: "reply" }] },
				{ role: "user", parts: [{ type: "text", text: "latest" }] },
			],
		});
		expect(mocks.embedQuery).toHaveBeenCalledWith("latest");
		expect(mocks.hybridSearch).toHaveBeenCalledTimes(1);
		expect(mocks.hybridSearch).toHaveBeenCalledWith("latest", [1, 2, 3], 8, {
			type: "solution",
			tag: "database-setup",
			source: "Shell history",
		});
		expect(mocks.modelFactory).toHaveBeenCalledWith("model-b");
		expect(payload).toContainEqual({ type: "text-delta", delta: "answer" });
		expect(payload).toContainEqual(
			expect.objectContaining({
				type: "source-document",
				sourceId: "chunk-1",
				providerMetadata: {
					custom: expect.objectContaining({ score: 0.8, distance: 0.2 }),
				},
			}),
		);
	});

	it.each([
		{ type: "memo" },
		{ tag: "" },
		{ tag: "x".repeat(51) },
		{ source: "" },
		{ source: "x".repeat(501) },
		{ extra: "value" },
	])("rejects invalid filters %j before provider calls", async (filters) => {
		const response = await POST(
			request({
				filters,
				messages: [
					{ role: "user", parts: [{ type: "text", text: "question" }] },
				],
			}),
		);
		expect(response.status).toBe(400);
		expect(mocks.getGroqModelIds).not.toHaveBeenCalled();
		expect(mocks.embedQuery).not.toHaveBeenCalled();
	});

	it("falls back for an unavailable model and skips retrieval for an empty query", async () => {
		await responsePayload({
			model: "unknown",
			messages: [{ role: "assistant", parts: [] }],
		});
		expect(mocks.modelFactory).toHaveBeenCalledWith("model-a");
		expect(mocks.embedQuery).not.toHaveBeenCalled();
		expect(mocks.hybridSearch).not.toHaveBeenCalled();
	});

	it("uses the shared confidence-gated context", async () => {
		const many = Array.from({ length: 10 }, (_, i) => ({
			id: String(i),
			content: `question evidence-${i}`,
			distance: i / 10,
		}));
		mocks.hybridSearch.mockResolvedValue(many);
		await responsePayload({
			messages: [{ role: "user", parts: [{ type: "text", text: "question" }] }],
		});
		const system = latestStreamTextArgs().system as string;
		expect(system).toContain("evidence-0");
		expect(system).toContain("evidence-9");
	});

	it("continues without context when retrieval fails", async () => {
		mocks.embedQuery.mockRejectedValue(new Error("embedding failed"));
		await responsePayload({
			messages: [{ role: "user", parts: [{ type: "text", text: "question" }] }],
		});
		expect(latestStreamTextArgs().system).toContain(
			"no relevant context was found",
		);
	});

	it("uses the normal no-context prompt for an empty scoped match", async () => {
		mocks.hybridSearch.mockResolvedValue([]);
		await responsePayload({
			filters: { type: "error" },
			messages: [{ role: "user", parts: [{ type: "text", text: "question" }] }],
		});
		expect(latestStreamTextArgs().system).toContain(
			"no relevant context was found",
		);
	});

	it("uses the normal no-context prompt when confidence removes weak results", async () => {
		mocks.hybridSearch.mockResolvedValue([
			{ id: "noise", content: "unrelated evidence", distance: 0.1 },
		]);
		await responsePayload({
			messages: [{ role: "user", parts: [{ type: "text", text: "question" }] }],
		});
		expect(latestStreamTextArgs().system).toContain(
			"no relevant context was found",
		);
	});

	it("surfaces provider failure while consuming the response stream", async () => {
		mocks.streamText.mockImplementation(() => {
			throw new Error("provider failed");
		});
		const response = await POST(
			request({
				messages: [
					{ role: "user", parts: [{ type: "text", text: "question" }] },
				],
			}),
		);
		expect(response.status).toBe(200);
		await expect(response.text()).rejects.toThrow("provider failed");
	});
});
