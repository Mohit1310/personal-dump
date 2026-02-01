import { NextResponse } from "next/server";
import { z } from "zod";
import { embedQuery } from "@/lib/embeddings/embed-query";
import { generateAnswer } from "@/lib/rag/generate-answer";
import { vectorSearch } from "@/lib/retrieval/vector-search";

const searchSchema = z.object({
	query: z.string().min(1, "Query is required"),
	topK: z.number().int().positive().optional().default(8),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const validatedData = searchSchema.safeParse(body);

		if (!validatedData.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validatedData.error.format() },
				{ status: 400 },
			);
		}

		const { query, topK } = validatedData.data;

		// 1. Generate embedding for the query
		const queryVector = await embedQuery(query);

		// 2. Perform vector search
		const results = await vectorSearch(queryVector, topK);

		// 3. Generate answer using RAG
		const answer = await generateAnswer({ userQuery: query, chunks: results });

		return NextResponse.json({
			answer,
			sources: results,
		});
	} catch (error) {
		console.error("Search API Error:", error);
		return NextResponse.json(
			{
				error: "Search failed",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
