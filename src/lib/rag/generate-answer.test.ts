import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildRagContext } from "./context";

const generateContent = vi.fn();
const testEnv = vi.hoisted(() => ({
	DATABASE_URL: "postgresql://localhost/test",
	GEMINI_API_KEY: "test-gemini-key",
	GROQ_API_KEY: "test-groq-key",
	NODE_ENV: "test" as const,
}));

vi.mock("@/env", () => ({ env: testEnv }));
vi.mock("@google/genai", () => ({
	GoogleGenAI: vi.fn(() => ({ models: { generateContent } })),
}));

const chunk = (id: string, content = id) => ({ id, content, distance: 0.1 });

describe("generateAnswer", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it("refuses empty context", async () => {
		const { generateAnswer } = await import("./generate-answer");
		expect(
			await generateAnswer({
				userQuery: "unknown",
				context: buildRagContext("unknown", []),
			}),
		).toContain("couldn't find");
		expect(generateContent).not.toHaveBeenCalled();
	});

	it("uses the prepared, budgeted context in the prompt", async () => {
		generateContent.mockResolvedValue({ text: "answer" });
		const { generateAnswer } = await import("./generate-answer");
		await generateAnswer({
			userQuery: "question",
			context: buildRagContext(
				"context",
				Array.from({ length: 10 }, (_, i) => chunk(String(i), `context ${i}`)),
			),
		});
		const request = generateContent.mock.calls[0]?.[0];
		if (!request) throw new Error("Gemini request was not captured");
		const prompt = request.contents?.[0]?.parts?.[0]?.text;
		if (typeof prompt !== "string")
			throw new Error("Gemini prompt was not captured");
		expect(prompt).toContain("[Chunk 1 | chunk: 0]");
		expect(prompt).toContain("[Chunk 10 | chunk: 9]");
		expect(prompt).toContain("User Question: question");
	});

	it("returns model output, falls back for missing output, and normalizes provider errors", async () => {
		const { generateAnswer } = await import("./generate-answer");
		generateContent.mockResolvedValueOnce({ text: "model answer" });
		expect(
			await generateAnswer({
				userQuery: "q",
				context: buildRagContext("q", [chunk("context", "q context")]),
			}),
		).toBe("model answer");
		generateContent.mockResolvedValueOnce({});
		expect(
			await generateAnswer({
				userQuery: "q",
				context: buildRagContext("q", [chunk("context", "q context")]),
			}),
		).toBe("Failed to generate answer.");
		generateContent.mockRejectedValueOnce(new Error("offline"));
		await expect(
			generateAnswer({
				userQuery: "q",
				context: buildRagContext("q", [chunk("context", "q context")]),
			}),
		).rejects.toThrow("Failed to generate answer from Gemini");
	});
});
