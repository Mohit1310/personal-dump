import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 200;
const MAX_SOURCE_LENGTH = 500;
const MAX_TAG_LENGTH = 50;

const listSchema = z
	.object({
		q: z.string().trim().min(1).max(MAX_SEARCH_LENGTH).optional(),
		type: z.enum(["note", "error", "solution"]).optional(),
		tag: z.string().trim().min(1).max(MAX_TAG_LENGTH).optional(),
		source: z.string().trim().min(1).max(MAX_SOURCE_LENGTH).optional(),
		page: z.coerce.number().int().min(1).optional().default(1),
		pageSize: z.coerce
			.number()
			.int()
			.min(1)
			.max(MAX_PAGE_SIZE)
			.optional()
			.default(DEFAULT_PAGE_SIZE),
	})
	.strict();

const duplicateParameters = (searchParams: URLSearchParams) =>
	[...new Set(searchParams.keys())].some(
		(key) => searchParams.getAll(key).length > 1,
	);

export async function GET(request: Request) {
	const url = new URL(request.url);
	if (duplicateParameters(url.searchParams)) {
		return NextResponse.json(
			{ error: "Invalid query parameters" },
			{ status: 400 },
		);
	}

	const parsed = listSchema.safeParse(
		Object.fromEntries(url.searchParams.entries()),
	);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid query parameters", details: parsed.error.format() },
			{ status: 400 },
		);
	}

	const { page, pageSize, q, source, tag, type } = parsed.data;
	const where = {
		...(q
			? {
					OR: [
						{ content: { contains: q, mode: "insensitive" as const } },
						{ title: { contains: q, mode: "insensitive" as const } },
					],
				}
			: {}),
		...(type ? { type } : {}),
		...(tag ? { tags: { has: tag.toLowerCase().replace(/\s+/g, "-") } } : {}),
		...(source
			? { source: { contains: source, mode: "insensitive" as const } }
			: {}),
	};

	try {
		const [dumps, total] = await db.$transaction([
			db.dump.findMany({
				where,
				orderBy: [{ createdAt: "desc" }, { id: "desc" }],
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: {
					id: true,
					title: true,
					type: true,
					tags: true,
					source: true,
					createdAt: true,
					updatedAt: true,
				},
			}),
			db.dump.count({ where }),
		]);

		return NextResponse.json({
			dumps,
			pagination: {
				page,
				pageSize,
				total,
				totalPages: Math.ceil(total / pageSize),
			},
		});
	} catch (error) {
		console.error("Dumps list API Error:", error);
		return NextResponse.json(
			{
				error: "Failed to retrieve dumps",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
