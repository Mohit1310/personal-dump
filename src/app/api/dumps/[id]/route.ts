import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";

const paramsSchema = z.object({ id: z.uuid() });

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const parsed = paramsSchema.safeParse(await params);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid dump id" }, { status: 400 });
	}

	try {
		const dump = await db.dump.findUnique({
			where: { id: parsed.data.id },
			select: {
				id: true,
				content: true,
				title: true,
				type: true,
				tags: true,
				source: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!dump) {
			return NextResponse.json({ error: "Dump not found" }, { status: 404 });
		}

		return NextResponse.json({ dump });
	} catch (error) {
		console.error("Dump detail API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to retrieve dump",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
