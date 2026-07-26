import { z } from "zod";
import {
	dumpTypeSchema,
	MAX_SOURCE_LENGTH,
	tagSchema,
} from "@/lib/dump-metadata";

export const retrievalFiltersSchema = z
	.object({
		type: dumpTypeSchema.optional(),
		tag: tagSchema.optional(),
		source: z
			.string()
			.trim()
			.min(1, "Source cannot be empty")
			.max(
				MAX_SOURCE_LENGTH,
				`Source must be at most ${MAX_SOURCE_LENGTH} characters`,
			)
			.optional(),
	})
	.strict();

export type RetrievalFilters = z.infer<typeof retrievalFiltersSchema>;
