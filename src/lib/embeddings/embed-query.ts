import { GoogleGenAI } from "@google/genai";
import { env } from "@/env";

const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Embeds a string query into a 768-dimensional vector using Gemini.
 */
export async function embedQuery(query: string): Promise<number[]> {
	try {
		const response = await client.models.embedContent({
			model: "gemini-embedding-001",
			contents: [query],
			config: {
				outputDimensionality: 768,
			},
		});

		const embedding = response.embeddings?.[0];
		if (!embedding || !embedding.values) {
			throw new Error("No embedding found in response");
		}

		return embedding.values;
	} catch (error) {
		console.error("Error embedding query:", error);
		throw new Error("Failed to generate embedding");
	}
}
