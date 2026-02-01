import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { embedQuery } from "@/lib/embeddings/embed-query";
import { chunkText } from "@/lib/processing/chunk-text";

const dumpSchema = z.object({
	content: z.string().min(1, "Content is required"),
	type: z.enum(["note", "error", "solution"]).optional().default("note"),
});

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const validatedData = dumpSchema.safeParse(body);

		if (!validatedData.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validatedData.error.format() },
				{ status: 400 },
			);
		}

		const { content } = validatedData.data;

		// 1. Create the main Dump record
		const dump = await db.dump.create({
			data: {
				content,
			},
		});

		// 2. Chunk the content
		const chunks = chunkText(content);

		// 3. Process each chunk
		const chunkPromises = chunks.map(async (chunkContent, index) => {
			// a. Create the Chunk record
			const chunk = await db.chunk.create({
				data: {
					dumpId: dump.id,
					content: chunkContent,
					order: index,
				},
			});

			// b. Generate embedding
			const embeddingVector = await embedQuery(chunkContent);

			// c. Store embedding using raw SQL for pgvector compatibility
			const embeddingId = crypto.randomUUID();
			const vectorString = `[${embeddingVector.join(",")}]`;

			await db.$executeRawUnsafe(
				'INSERT INTO "Embedding" (id, "chunkId", vector, "createdAt") VALUES ($1, $2, $3::vector, $4)',
				embeddingId,
				chunk.id,
				vectorString,
				new Date(),
			);

			return { chunkId: chunk.id, embeddingId };
		});

		await Promise.all(chunkPromises);

		return NextResponse.json({
			success: true,
			dumpId: dump.id,
			chunksCreated: chunks.length,
		});
	} catch (error) {
		console.error("Dump API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to store dump",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
