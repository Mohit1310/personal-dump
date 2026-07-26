import { describe, expect, it } from "vitest";
import { corpus, recallAt8, reciprocalRank } from "./schema";

describe("deterministic RAG evaluation scaffolding", () => {
	it("computes Recall@8 and reciprocal rank", () => {
		expect(recallAt8(["noise", "error-fix"], ["error-fix"])).toBe(1);
		expect(reciprocalRank(["noise", "error-fix"], ["error-fix"])).toBe(0.5);
		expect(recallAt8(["noise"], ["error-fix"])).toBe(0);
	});

	it("covers refusal, citations, code/error-solution, conflicts, and stored instructions", () => {
		expect(corpus.cases.find((item) => item.id === "unknown")?.mustRefuse).toBe(
			true,
		);
		expect(
			corpus.cases.every((item) =>
				item.relevantChunkIds.every((id) =>
					corpus.chunks.some((chunk) => chunk.id === id),
				),
			),
		).toBe(true);
		expect(corpus.cases.find((item) => item.id === "error")?.tags).toEqual([
			"error",
			"solution",
		]);
		expect(
			corpus.cases.find((item) => item.id === "code")?.expectedAnswer,
		).toContain("pnpm test");
		expect(
			corpus.cases.find((item) => item.id === "conflict")?.relevantChunkIds,
		).toHaveLength(2);
		expect(
			corpus.cases.find((item) => item.id === "stored-instruction")?.tags,
		).toContain("prompt-injection-like");
	});
});
