import type { SearchResult } from "@/lib/retrieval/vector-search";

export const MIN_RELEVANT_TOKEN_OVERLAP = 1;
export const STRONG_CONTENT_OVERLAP = 0.8;
export const RAG_CONTEXT_CHARACTER_BUDGET = 12_000;

const STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"are",
	"as",
	"at",
	"be",
	"before",
	"but",
	"by",
	"do",
	"for",
	"from",
	"how",
	"i",
	"in",
	"is",
	"it",
	"my",
	"of",
	"on",
	"or",
	"that",
	"the",
	"to",
	"what",
	"which",
	"who",
	"with",
]);

export interface RagContext {
	chunks: SearchResult[];
	contextBlock: string;
}

const tokens = (value: string): Set<string> =>
	new Set(
		(value.toLocaleLowerCase().match(/[\p{L}\p{N}_-]+/gu) ?? []).filter(
			(token) => !STOP_WORDS.has(token),
		),
	);

export const tokenOverlap = (left: string, right: string): number => {
	const leftTokens = tokens(left);
	const rightTokens = tokens(right);
	return [...leftTokens].filter((token) => rightTokens.has(token)).length;
};

const overlapRatio = (left: string, right: string): number => {
	const leftTokens = tokens(left);
	const rightTokens = tokens(right);
	const shared = [...leftTokens].filter((token) =>
		rightTokens.has(token),
	).length;
	const smallestSet = Math.min(leftTokens.size, rightTokens.size);
	return smallestSet === 0 ? 0 : shared / smallestSet;
};

export function filterRelevantResults(
	query: string,
	results: SearchResult[],
): SearchResult[] {
	return results.filter(
		(result) =>
			tokenOverlap(query, result.content) >= MIN_RELEVANT_TOKEN_OVERLAP,
	);
}

const isDuplicateEvidence = (
	candidate: SearchResult,
	selected: SearchResult[],
): boolean =>
	selected.some(
		(result) =>
			result.content.trim() === candidate.content.trim() ||
			overlapRatio(result.content, candidate.content) >= STRONG_CONTENT_OVERLAP,
	);

const formatEvidence = (chunk: SearchResult, number: number): string =>
	`[Chunk ${number} | chunk: ${chunk.id}${chunk.dumpId ? ` | dump: ${chunk.dumpId}` : ""}]\n${chunk.content}`;

/**
 * Keeps whole, distinct evidence chunks in retrieval order. Character budgeting is
 * intentionally used instead of model-token accounting: it is deterministic across
 * the Gemini and Groq answer paths and avoids adding model-specific tokenization.
 */
export function buildRagContext(
	query: string,
	results: SearchResult[],
	characterBudget = RAG_CONTEXT_CHARACTER_BUDGET,
): RagContext {
	const selected: SearchResult[] = [];
	const blocks: string[] = [];

	for (const result of filterRelevantResults(query, results)) {
		if (isDuplicateEvidence(result, selected)) continue;
		const block = formatEvidence(result, selected.length + 1);
		const contextBlock = [...blocks, block].join("\n---\n");
		if (contextBlock.length > characterBudget) continue;
		selected.push(result);
		blocks.push(block);
	}

	return { chunks: selected, contextBlock: blocks.join("\n---\n") };
}
