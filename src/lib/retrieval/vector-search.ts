import { db } from "@/server/db";
import { type RetrievalFilters, retrievalFiltersSchema } from "./filters";

export interface SearchResult {
	id: string;
	dumpId?: string;
	content: string;
	distance: number;
}

interface RankedSearchResult extends SearchResult {
	rank: number;
}

export const DEFAULT_RETRIEVAL_TOP_K = 8;
export const MAX_RETRIEVAL_TOP_K = 20;
const RRF_K = 60;

const validateSearchInput = (topK: number, filters?: RetrievalFilters) => {
	if (!Number.isInteger(topK) || topK < 1 || topK > MAX_RETRIEVAL_TOP_K) {
		throw new Error(`topK must be an integer from 1 to ${MAX_RETRIEVAL_TOP_K}`);
	}

	return retrievalFiltersSchema.parse(filters ?? {});
};

const candidateLimitFor = (topK: number) => Math.min(topK * 3, 60);

const searchVectorCandidates = async (
	queryVector: number[],
	candidateLimit: number,
	filters: RetrievalFilters,
): Promise<RankedSearchResult[]> => {
	const vectorString = `[${queryVector.join(",")}]`;
	const results = await db.$queryRawUnsafe<SearchResult[]>(
		`
      SELECT
        c.id,
		c."dumpId" AS "dumpId",
        c.content,
        (e.vector <=> $1::vector) AS distance
      FROM "Embedding" e
      JOIN "Chunk" c ON c.id = e."chunkId"
      JOIN "Dump" d ON d.id = c."dumpId"
      WHERE ($3::text IS NULL OR d.type::text = $3)
        AND ($4::text IS NULL OR $4 = ANY(d.tags))
        AND ($5::text IS NULL OR LOWER(d.source) = LOWER($5))
      ORDER BY distance ASC, c.id ASC
      LIMIT $2;
      `,
		vectorString,
		candidateLimit,
		filters.type ?? null,
		filters.tag ?? null,
		filters.source ?? null,
	);

	return results.map((result, index) => ({ ...result, rank: index + 1 }));
};

const searchLexicalCandidates = async (
	query: string,
	queryVector: number[],
	candidateLimit: number,
	filters: RetrievalFilters,
): Promise<RankedSearchResult[]> => {
	const vectorString = `[${queryVector.join(",")}]`;
	const results = await db.$queryRawUnsafe<SearchResult[]>(
		`
      WITH search_query AS (
        SELECT to_tsquery(
          'simple',
          array_to_string(
            tsvector_to_array(to_tsvector('simple', $1)),
            ' | '
          )
        ) AS value
      )
      SELECT
        c.id,
		c."dumpId" AS "dumpId",
        c.content,
        (e.vector <=> $2::vector) AS distance
      FROM search_query q
      JOIN "Chunk" c ON to_tsvector('simple', c.content) @@ q.value
      JOIN "Embedding" e ON e."chunkId" = c.id
      JOIN "Dump" d ON d.id = c."dumpId"
      WHERE ($4::text IS NULL OR d.type::text = $4)
        AND ($5::text IS NULL OR $5 = ANY(d.tags))
        AND ($6::text IS NULL OR LOWER(d.source) = LOWER($6))
      ORDER BY ts_rank_cd(to_tsvector('simple', c.content), q.value) DESC, c.id ASC
      LIMIT $3;
      `,
		query,
		vectorString,
		candidateLimit,
		filters.type ?? null,
		filters.tag ?? null,
		filters.source ?? null,
	);

	return results.map((result, index) => ({ ...result, rank: index + 1 }));
};

export function fuseRankings(
	vectorCandidates: RankedSearchResult[],
	lexicalCandidates: RankedSearchResult[],
	topK: number,
): SearchResult[] {
	const combined = new Map<
		string,
		{
			result: SearchResult;
			score: number;
			lexicalRank?: number;
			vectorRank?: number;
		}
	>();

	for (const [kind, candidates] of [
		["vector", vectorCandidates],
		["lexical", lexicalCandidates],
	] as const) {
		for (const candidate of candidates) {
			const current = combined.get(candidate.id);
			combined.set(candidate.id, {
				result: current?.result ?? candidate,
				score: (current?.score ?? 0) + 1 / (RRF_K + candidate.rank),
				vectorRank: kind === "vector" ? candidate.rank : current?.vectorRank,
				lexicalRank: kind === "lexical" ? candidate.rank : current?.lexicalRank,
			});
		}
	}

	return [...combined.values()]
		.sort(
			(left, right) =>
				right.score - left.score ||
				(left.lexicalRank ?? Infinity) - (right.lexicalRank ?? Infinity) ||
				(left.vectorRank ?? Infinity) - (right.vectorRank ?? Infinity) ||
				left.result.id.localeCompare(right.result.id),
		)
		.slice(0, topK)
		.map(({ result }) => result);
}

/**
 * Performs vector-only similarity search using pgvector's cosine distance operator.
 * This stays available for deterministic before/after evaluation comparisons.
 */
export async function vectorSearch(
	queryVector: number[],
	topK = DEFAULT_RETRIEVAL_TOP_K,
	filters?: RetrievalFilters,
): Promise<SearchResult[]> {
	try {
		const validatedFilters = validateSearchInput(topK, filters);
		return (
			await searchVectorCandidates(queryVector, topK, validatedFilters)
		).map(({ rank: _, ...result }) => result);
	} catch (error) {
		console.error("Error performing vector search:", error);
		throw new Error("Failed to perform vector search");
	}
}

/** Performs bounded PostgreSQL full-text and vector retrieval with reciprocal-rank fusion. */
export async function hybridSearch(
	query: string,
	queryVector: number[],
	topK = DEFAULT_RETRIEVAL_TOP_K,
	filters?: RetrievalFilters,
): Promise<SearchResult[]> {
	try {
		const validatedFilters = validateSearchInput(topK, filters);
		const candidateLimit = candidateLimitFor(topK);
		const [vectorCandidates, lexicalCandidates] = await Promise.all([
			searchVectorCandidates(queryVector, candidateLimit, validatedFilters),
			searchLexicalCandidates(
				query,
				queryVector,
				candidateLimit,
				validatedFilters,
			),
		]);

		return fuseRankings(vectorCandidates, lexicalCandidates, topK);
	} catch (error) {
		console.error("Error performing hybrid search:", error);
		throw new Error("Failed to perform hybrid search");
	}
}
