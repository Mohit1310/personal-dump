import { z } from "zod";

export const MAX_TITLE_LENGTH = 200;
export const MAX_TAGS = 20;
export const MAX_TAG_LENGTH = 50;
export const MAX_SOURCE_LENGTH = 500;

export const normalizeTag = (tag: string) =>
	tag.trim().toLowerCase().replace(/\s+/g, "-");

const tagSchema = z
	.string()
	.trim()
	.min(1, "Tags cannot be empty")
	.max(MAX_TAG_LENGTH, `Tags must be at most ${MAX_TAG_LENGTH} characters`)
	.transform(normalizeTag);

export const dumpMetadataSchema = z
	.object({
		title: z.string().trim().max(MAX_TITLE_LENGTH).optional(),
		type: z.enum(["note", "error", "solution"]).optional(),
		tags: z
			.array(tagSchema)
			.max(MAX_TAGS)
			.optional()
			.transform((tags) => (tags ? [...new Set(tags)] : undefined)),
		source: z.string().trim().max(MAX_SOURCE_LENGTH).optional(),
	})
	.strict();
