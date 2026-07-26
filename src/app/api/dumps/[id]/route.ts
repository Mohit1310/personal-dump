import { NextResponse } from "next/server";
import { z } from "zod";
import { dumpMetadataSchema } from "@/lib/dump-metadata";
import { db } from "@/server/db";

const paramsSchema = z.object({ id: z.uuid() });
const updateSchema = dumpMetadataSchema.refine(
	(metadata) => Object.keys(metadata).length > 0,
	"At least one metadata field is required",
);

const dumpSelect = {
	id: true,
	content: true,
	title: true,
	type: true,
	tags: true,
	source: true,
	createdAt: true,
	updatedAt: true,
} as const;

const isMissingRecordError = (error: unknown) =>
	typeof error === "object" &&
	error !== null &&
	"code" in error &&
	error.code === "P2025";

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
			select: dumpSelect,
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

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const parsedParams = paramsSchema.safeParse(await params);
	if (!parsedParams.success) {
		return NextResponse.json({ error: "Invalid dump id" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid input" }, { status: 400 });
	}
	const parsedBody = updateSchema.safeParse(body);
	if (!parsedBody.success) {
		return NextResponse.json(
			{ error: "Invalid input", details: parsedBody.error.format() },
			{ status: 400 },
		);
	}

	try {
		const dump = await db.dump.update({
			where: { id: parsedParams.data.id },
			data: parsedBody.data,
			select: dumpSelect,
		});

		return NextResponse.json({ dump });
	} catch (error) {
		if (isMissingRecordError(error)) {
			return NextResponse.json({ error: "Dump not found" }, { status: 404 });
		}
		console.error("Dump update API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to update dump",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const parsedParams = paramsSchema.safeParse(await params);
	if (!parsedParams.success) {
		return NextResponse.json({ error: "Invalid dump id" }, { status: 400 });
	}

	try {
		await db.dump.delete({ where: { id: parsedParams.data.id } });
		return NextResponse.json({ success: true });
	} catch (error) {
		if (isMissingRecordError(error)) {
			return NextResponse.json({ error: "Dump not found" }, { status: 404 });
		}
		console.error("Dump delete API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to delete dump",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
