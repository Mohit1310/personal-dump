import type { Prisma } from "@/generated/prisma";
import { z } from "zod";
import { embedQuery } from "@/lib/embeddings/embed-query";
import { chunkText } from "@/lib/processing/chunk-text";

export const MAX_DUMP_CONTENT_BYTES = 1_048_576;

export const isDumpContentTooLarge = (content: string) =>
	Buffer.byteLength(content, "utf8") > MAX_DUMP_CONTENT_BYTES;

export const dumpContentSchema = z
	.string()
	.min(1, "Content is required")
	.refine((content) => content.trim().length > 0, "Content is required")
	.refine(
		(content) => !isDumpContentTooLarge(content),
		`Content must be at most ${MAX_DUMP_CONTENT_BYTES} bytes`,
	);

export type PreparedChunk = {
	content: string;
	vector: number[];
};

export async function prepareDumpContent(
	content: string,
): Promise<PreparedChunk[]> {
	const chunks = chunkText(content);
	const embeddings = await Promise.all(chunks.map(embedQuery));

	return chunks.map((chunk, index) => ({
		content: chunk,
		vector: embeddings[index]!,
	}));
}

export async function insertPreparedChunks(
	tx: Prisma.TransactionClient,
	dumpId: string,
	chunks: PreparedChunk[],
) {
	for (const [order, preparedChunk] of chunks.entries()) {
		const chunk = await tx.chunk.create({
			data: {
				dumpId,
				content: preparedChunk.content,
				order,
			},
		});
		const vector = `[${preparedChunk.vector.join(",")}]`;

		await tx.$executeRaw`
			INSERT INTO "Embedding" (id, "chunkId", vector, "createdAt")
			VALUES (${crypto.randomUUID()}, ${chunk.id}, ${vector}::vector, ${new Date()})
		`;
	}
}
