import { beforeEach, describe, expect, it, vi } from "vitest";

const embedContent = vi.fn();
const testEnv = vi.hoisted(() => ({
	DATABASE_URL: "postgresql://localhost/test",
	GEMINI_API_KEY: "test-gemini-key",
	GROQ_API_KEY: "test-groq-key",
	NODE_ENV: "test" as const,
}));

vi.mock("@/env", () => ({ env: testEnv }));

vi.mock("@google/genai", () => ({
	GoogleGenAI: vi.fn(() => ({ models: { embedContent } })),
}));

describe("embedQuery", () => {
	beforeEach(() => {
		vi.resetModules();
	vi.clearAllMocks();
	});

	it("calls Gemini with the embedding model and 768 dimensions", async () => {
		embedContent.mockResolvedValue({ embeddings: [{ values: [0.1, 0.2] }] });
		const { embedQuery } = await import("./embed-query");

		expect(await embedQuery("how do I fix this?")).toEqual([0.1, 0.2]);
		expect(embedContent).toHaveBeenCalledWith({
		model: "gemini-embedding-001",
		contents: ["how do I fix this?"],
		config: { outputDimensionality: 768 },
	});
	});

	it("normalizes missing embeddings and provider failures", async () => {
		embedContent.mockResolvedValue({ embeddings: [] });
		const { embedQuery } = await import("./embed-query");
		await expect(embedQuery("missing")).rejects.toThrow("Failed to generate embedding");

		embedContent.mockRejectedValue(new Error("offline provider"));
		await expect(embedQuery("failure")).rejects.toThrow("Failed to generate embedding");
	});
});
