import { beforeEach, describe, expect, it, vi } from "vitest";

const generateContent = vi.fn();
const testEnv = vi.hoisted(() => ({
	DATABASE_URL: "postgresql://localhost/test",
	GEMINI_API_KEY: "test-gemini-key",
	GROQ_API_KEY: "test-groq-key",
	NODE_ENV: "test" as const,
}));

vi.mock("@/env", () => ({ env: testEnv }));
vi.mock("@google/genai", () => ({ GoogleGenAI: vi.fn(() => ({ models: { generateContent } })) }));

const chunk = (id: string, content = id) => ({ id, content, distance: 0.1 });

describe("generateAnswer", () => {
	beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); });

	it("refuses empty context", async () => {
		const { generateAnswer } = await import("./generate-answer");
		expect(await generateAnswer({ userQuery: "unknown", chunks: [] })).toContain("couldn't find");
		expect(generateContent).not.toHaveBeenCalled();
	});

	it("uses only the top eight chunks in the prompt", async () => {
		generateContent.mockResolvedValue({ text: "answer" });
		const { generateAnswer } = await import("./generate-answer");
		await generateAnswer({ userQuery: "question", chunks: Array.from({ length: 10 }, (_, i) => chunk(String(i))) });
		const request = generateContent.mock.calls[0]?.[0];
		if (!request) throw new Error("Gemini request was not captured");
		const prompt = request.contents?.[0]?.parts?.[0]?.text;
		if (typeof prompt !== "string") throw new Error("Gemini prompt was not captured");
		expect(prompt).toContain("0");
		expect(prompt).toContain("7");
		expect(prompt).not.toContain("[Chunk 9]");
		expect(prompt).toContain("User Question: question");
	});

	it("returns model output, falls back for missing output, and normalizes provider errors", async () => {
		const { generateAnswer } = await import("./generate-answer");
		generateContent.mockResolvedValueOnce({ text: "model answer" });
		expect(await generateAnswer({ userQuery: "q", chunks: [chunk("context")] })).toBe("model answer");
		generateContent.mockResolvedValueOnce({});
		expect(await generateAnswer({ userQuery: "q", chunks: [chunk("context")] })).toBe("Failed to generate answer.");
		generateContent.mockRejectedValueOnce(new Error("offline"));
		await expect(generateAnswer({ userQuery: "q", chunks: [chunk("context")] })).rejects.toThrow("Failed to generate answer from Gemini");
	});
});
