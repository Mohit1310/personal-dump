import { NextResponse } from "next/server";
import {
	dumpContentSchema,
	insertPreparedChunks,
	isDumpContentTooLarge,
	prepareDumpContent,
} from "@/lib/dump-content";
import { dumpMetadataSchema } from "@/lib/dump-metadata";
import { db } from "@/server/db";

const dumpSchema = dumpMetadataSchema.extend({
	content: dumpContentSchema,
});

export async function POST(req: Request) {
	try {
		let body: unknown;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: "Invalid input" }, { status: 400 });
		}
		if (
			typeof body === "object" &&
			body !== null &&
			"content" in body &&
			typeof body.content === "string" &&
			isDumpContentTooLarge(body.content)
		) {
			return NextResponse.json({ error: "Content too large" }, { status: 413 });
		}
		const validatedData = dumpSchema.safeParse(body);

		if (!validatedData.success) {
			return NextResponse.json(
				{ error: "Invalid input", details: validatedData.error.format() },
				{ status: 400 },
			);
		}

		const {
			content,
			source = "",
			tags = [],
			title = "",
			type = "note",
		} = validatedData.data;

		// Prepare all external work before opening a database transaction.
		const chunks = await prepareDumpContent(content);

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

			await insertPreparedChunks(tx, createdDump.id, chunks);

			return createdDump;
		});

		return NextResponse.json({
			success: true,
			dumpId: dump.id,
			chunksCreated: chunks.length,
		});
	} catch (error) {
		console.error("Dump API Error:", error);
		return NextResponse.json({ error: "Failed to store dump" }, { status: 500 });
	}
}
