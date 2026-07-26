import { NextResponse } from "next/server";
import { z } from "zod";
import { embedQuery } from "@/lib/embeddings/embed-query";
import { chunkText } from "@/lib/processing/chunk-text";
import { db } from "@/server/db";

const MAX_TITLE_LENGTH = 200;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;
const MAX_SOURCE_LENGTH = 500;

const tagSchema = z
	.string()
	.trim()
	.min(1, "Tags cannot be empty")
	.max(MAX_TAG_LENGTH, `Tags must be at most ${MAX_TAG_LENGTH} characters`)
	.transform((tag) => tag.toLowerCase().replace(/\s+/g, "-"));

const dumpSchema = z.object({
	content: z
		.string()
		.min(1, "Content is required")
		.refine((content) => content.trim().length > 0, "Content is required"),
	title: z.string().trim().max(MAX_TITLE_LENGTH).optional().default(""),
	type: z.enum(["note", "error", "solution"]).optional().default("note"),
	tags: z
		.array(tagSchema)
		.max(MAX_TAGS)
		.optional()
		.default([])
		.transform((tags) => [...new Set(tags)]),
	source: z.string().trim().max(MAX_SOURCE_LENGTH).optional().default(""),
});

export async function POST(req: Request) {
	try {
		let body: unknown;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: "Invalid input" }, { status: 400 });
		}
		const validatedData = dumpSchema.safeParse(body);

		if (!validatedData.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validatedData.error.format() },
				{ status: 400 },
			);
		}

		const { content, source, tags, title, type } = validatedData.data;

		// Prepare all external work before opening a database transaction.
		const chunks = chunkText(content);
		const embeddings = await Promise.all(chunks.map(embedQuery));

		const dump = await db.$transaction(async (tx) => {
			const createdDump = await tx.dump.create({
				data: {
					content,
					source,
					tags,
					title,
					type,
				},
			});

			for (const [index, chunkContent] of chunks.entries()) {
				const chunk = await tx.chunk.create({
					data: {
						dumpId: createdDump.id,
						content: chunkContent,
						order: index,
					},
				});
				const vectorString = `[${embeddings[index]!.join(",")}]`;

				await tx.$executeRaw`
					INSERT INTO "Embedding" (id, "chunkId", vector, "createdAt")
					VALUES (${crypto.randomUUID()}, ${chunk.id}, ${vectorString}::vector, ${new Date()})
				`;
			}

			return createdDump;
		});

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
