import { db } from "@/server/db";

export interface SearchResult {
	id: string;
	content: string;
	distance: number;
}

/**
 * Performs a vector similarity search using pgvector's cosine distance operator (<=>).
 * @param queryVector The 768-dimensional query embedding
 * @param topK Number of results to return (default: 8)
 */
export async function vectorSearch(
	queryVector: number[],
	topK = 8,
): Promise<SearchResult[]> {
	try {
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
      ORDER BY distance ASC
      LIMIT $2;
      `,
			vectorString,
			topK,
		);

		return results;
	} catch (error) {
		console.error("Error performing vector search:", error);
		throw new Error("Failed to perform vector search");
	}
}
