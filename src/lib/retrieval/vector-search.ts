import { db } from "@/server/db";
import { type RetrievalFilters, retrievalFiltersSchema } from "./filters";

export interface SearchResult {
	id: string;
	content: string;
	distance: number;
}

/**
 * Performs a vector similarity search using pgvector's cosine distance operator (<=>).
 * @param queryVector The 768-dimensional query embedding
 * @param topK Number of results to return (default: 8)
 * @param filters Optional dump metadata scope applied before ranking
 */
export async function vectorSearch(
	queryVector: number[],
	topK = 8,
	filters?: RetrievalFilters,
): Promise<SearchResult[]> {
	try {
		const validatedFilters = retrievalFiltersSchema.parse(filters ?? {});
		// We use $queryRawUnsafe because $queryRaw doesn't support parameterized vector casting easily
		// We safely pass parameters to avoid SQL injection
		const vectorString = `[${queryVector.join(",")}]`;

		const results = await db.$queryRawUnsafe<SearchResult[]>(
			`
      SELECT 
        c.id, 
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
			topK,
			validatedFilters.type ?? null,
			validatedFilters.tag ?? null,
			validatedFilters.source ?? null,
		);

		return results;
	} catch (error) {
		console.error("Error performing vector search:", error);
		throw new Error("Failed to perform vector search");
	}
}
