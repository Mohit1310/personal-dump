import { describe, expect, it } from "vitest";
import {
	buildRagContext,
	filterRelevantResults,
	MIN_RELEVANT_TOKEN_OVERLAP,
	RAG_CONTEXT_CHARACTER_BUDGET,
	STRONG_CONTENT_OVERLAP,
	tokenOverlap,
} from "./context";

const result = (id: string, content: string, dumpId = "dump-1") => ({
	id,
	dumpId,
	content,
	distance: 0.1,
});

describe("RAG context assembly", () => {
	it("keeps the calibrated confidence boundary below, at, and above one shared token", () => {
		const query = "alpha beta";
		expect(MIN_RELEVANT_TOKEN_OVERLAP).toBe(1);
		expect(tokenOverlap(query, "gamma")).toBe(0);
		expect(tokenOverlap(query, "alpha gamma")).toBe(1);
		expect(tokenOverlap(query, "alpha beta gamma")).toBe(2);
		expect(
			filterRelevantResults(query, [
				result("below", "gamma"),
				result("at", "alpha gamma"),
				result("above", "alpha beta gamma"),
			]).map(({ id }) => id),
		).toEqual(["at", "above"]);
	});

	it("deduplicates identical and strongly overlapping evidence while preserving ranked order and attribution", () => {
		const context = buildRagContext("query", [
			result("first", "query alpha beta gamma delta epsilon", "dump-a"),
			result("identical", "query alpha beta gamma delta epsilon", "dump-b"),
			result("overlap", "query alpha beta gamma delta epsilon zeta", "dump-c"),
			result("second", "query omega", "dump-d"),
		]);

		expect(STRONG_CONTENT_OVERLAP).toBe(0.8);
		expect(context.chunks.map(({ id }) => id)).toEqual(["first", "second"]);
		expect(context.contextBlock).toContain(
			"[Chunk 1 | chunk: first | dump: dump-a]",
		);
		expect(context.contextBlock).toContain(
			"[Chunk 2 | chunk: second | dump: dump-d]",
		);
	});

	it("uses a whole-chunk character budget at the exact boundary and skips overflow without corrupting fenced code", () => {
		const code = "query\n```ts\nconst answer = 42;\n```";
		const evidence = result("code", code);
		const full = buildRagContext(
			"query",
			[evidence],
			RAG_CONTEXT_CHARACTER_BUDGET,
		);
		const exact = buildRagContext(
			"query",
			[evidence],
			full.contextBlock.length,
		);
		const overflow = buildRagContext(
			"query",
			[evidence],
			full.contextBlock.length - 1,
		);

		expect(exact).toEqual(full);
		expect(overflow).toEqual({ chunks: [], contextBlock: "" });
		expect(full.contextBlock).toContain(code);
	});

	it("skips a single oversized result and retains later, whole evidence within budget", () => {
		const context = buildRagContext(
			"query",
			[
				result("oversized", `query ${"x".repeat(200)}`),
				result("small", "query retained evidence"),
			],
			80,
		);

		expect(context.chunks.map(({ id }) => id)).toEqual(["small"]);
		expect(context.contextBlock.length).toBeLessThanOrEqual(80);
	});

	it("returns empty context when no result meets the confidence rule", () => {
		expect(buildRagContext("query", [result("noise", "unrelated")])).toEqual({
			chunks: [],
			contextBlock: "",
		});
	});
});
