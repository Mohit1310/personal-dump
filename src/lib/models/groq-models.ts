import { z } from "zod";
import { env } from "@/env";

const DEFAULT_GROQ_MODEL = "qwen/qwen3-32b";
const CACHE_TTL_MS = 5 * 60 * 1000;

const groqModelsResponseSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
		}),
	),
});

let cachedModels: string[] | null = null;
let cachedAt = 0;

export async function getGroqModelIds(): Promise<string[]> {
	const now = Date.now();
	if (cachedModels && now - cachedAt < CACHE_TTL_MS) {
		return cachedModels;
	}

	try {
		const response = await fetch("https://api.groq.com/openai/v1/models", {
			headers: {
				Authorization: `Bearer ${env.GROQ_API_KEY}`,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error(`Groq models request failed (${response.status})`);
		}

		const parsed = groqModelsResponseSchema.parse(await response.json());
		const uniqueSortedIds = Array.from(
			new Set(parsed.data.map((m) => m.id)),
		)
			.filter((id) => !id.toLowerCase().includes("canopylabs"))
			.sort((a, b) => a.localeCompare(b));

		cachedModels =
			uniqueSortedIds.length > 0 ? uniqueSortedIds : [DEFAULT_GROQ_MODEL];
		cachedAt = now;
		return cachedModels;
	} catch (error) {
		console.error("Failed to fetch Groq models:", error);
		cachedModels = [DEFAULT_GROQ_MODEL];
		cachedAt = now;
		return cachedModels;
	}
}

export { DEFAULT_GROQ_MODEL };
