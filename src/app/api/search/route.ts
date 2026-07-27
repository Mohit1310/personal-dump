import { NextResponse } from "next/server";
import { z } from "zod";
import { embedQuery } from "@/lib/embeddings/embed-query";
import { generateAnswer } from "@/lib/rag/generate-answer";
import { retrievalFiltersSchema } from "@/lib/retrieval/filters";
import {
	DEFAULT_RETRIEVAL_TOP_K,
	hybridSearch,
	MAX_RETRIEVAL_TOP_K,
} from "@/lib/retrieval/vector-search";

const searchSchema = z.object({
	query: z.string().trim().min(1, "Query is required"),
	topK: z
		.number()
		.int()
		.min(1)
		.max(MAX_RETRIEVAL_TOP_K)
		.optional()
		.default(DEFAULT_RETRIEVAL_TOP_K),
	filters: retrievalFiltersSchema.optional(),
});

export async function POST(req: Request) {
	try {
		let body: unknown;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: "Invalid input" }, { status: 400 });
		}
		const validatedData = searchSchema.safeParse(body);

		if (!validatedData.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validatedData.error.format() },
				{ status: 400 },
			);
		}

		const { filters, query, topK } = validatedData.data;

		// 1. Generate embedding for the query
		const queryVector = await embedQuery(query);

		// 2. Perform bounded hybrid retrieval.
		const results = await hybridSearch(query, queryVector, topK, filters);

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
