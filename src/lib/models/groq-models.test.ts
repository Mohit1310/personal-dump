import { beforeEach, describe, expect, it, vi } from "vitest";

const testEnv = vi.hoisted(() => ({
	DATABASE_URL: "postgresql://localhost/test",
	GEMINI_API_KEY: "test-gemini-key",
	GROQ_API_KEY: "test-groq-key",
	NODE_ENV: "test" as const,
}));

vi.mock("@/env", () => ({ env: testEnv }));

describe("getGroqModelIds", () => {
	beforeEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.resetModules();
	});

	it("deduplicates, filters canopy models, and sorts ids", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				JSON.stringify({
					data: [
						{ id: "z-model" },
						{ id: "a-model" },
						{ id: "a-model" },
						{ id: "CanopyLabs/test" },
					],
				}),
				{ status: 200 },
			),
		);
		const { getGroqModelIds } = await import("./groq-models");
		expect(await getGroqModelIds()).toEqual(["a-model", "z-model"]);
	});

	it("caches for five minutes and refreshes after expiry", async () => {
		const fetchMock = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(
				new Response(JSON.stringify({ data: [{ id: "model" }] }), {
					status: 200,
				}),
			);
		const { getGroqModelIds } = await import("./groq-models");
		vi.useFakeTimers();
		const first = await getGroqModelIds();
		await getGroqModelIds();
		expect(fetchMock).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(5 * 60 * 1000);
		await getGroqModelIds();
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(first).toEqual(["model"]);
	});

	it("falls back for HTTP, malformed, empty, and network failures", async () => {
		for (const response of [
			new Response("{}", { status: 200 }),
			new Response(JSON.stringify({ data: [] }), { status: 200 }),
			new Response("", { status: 503 }),
		]) {
			vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response);
			const { DEFAULT_GROQ_MODEL, getGroqModelIds } =
				await import("./groq-models");
			expect(await getGroqModelIds()).toEqual([DEFAULT_GROQ_MODEL]);
			vi.restoreAllMocks();
			vi.resetModules();
		}
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
		const { DEFAULT_GROQ_MODEL, getGroqModelIds } =
			await import("./groq-models");
		expect(await getGroqModelIds()).toEqual([DEFAULT_GROQ_MODEL]);
	});
});
