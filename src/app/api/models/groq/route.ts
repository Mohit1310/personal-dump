import { getGroqModelIds } from "@/lib/models/groq-models";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const models = await getGroqModelIds();
		return Response.json({ models });
	} catch (error) {
		console.error("Groq models API error:", error);
		return Response.json(
			{ error: "Failed to load Groq models" },
			{ status: 500 },
		);
	}
}
