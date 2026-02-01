import { GoogleGenAI } from "@google/genai";
import { env } from "@/env";

const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

interface SearchResult {
	id: string;
	content: string;
	distance: number;
}

interface GenerateAnswerParams {
	userQuery: string;
	chunks: SearchResult[];
}

/**
 * Generates a RAG-based answer using retrieved chunks.
 */
export async function generateAnswer({
	userQuery,
	chunks,
}: GenerateAnswerParams): Promise<string> {
	if (chunks.length === 0) {
		return "I couldn't find any relevant information in your personal dump to answer this question.";
	}

	// 1. Build context block
	const contextBlock = chunks
		.slice(0, 8) // Limit to top 8 chunks
		.map((chunk, i) => `[Chunk ${i + 1}]\n${chunk.content}`)
		.join("\n---\n");

	// 2. Define strict system rules
	const systemPrompt = `
You are a highly capable AI assistant helping a user explore their "personal dump" of notes, code, and documents.
Your goal is to provide a clear, helpful, and accurate answer based **ONLY** on the context provided below.

STRICT RULES:
1. Use ONLY the provided context to answer. 
2. If the answer is not in the context, explicitly state: "I don't have enough information in your personal dump to answer that."
3. Do NOT hallucinate or use external knowledge.
4. Use professional yet friendly tone.
5. Format your response in clean Markdown.
6. Use code blocks for any code segments.
7. List steps clearly using bullet points or numbered lists.
8. If the user asks about an error, try to identify the fix based on the context.

Retrieved Context:
${contextBlock}
`.trim();

	try {
		// 3. Generate content
		const result = await client.models.generateContent({
			model: "gemini-2.5-flash",
			contents: [
				{
					role: "user",
					parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuery}` }],
				},
			],
		});

		const text = result.text;
		return text ?? "Failed to generate answer.";
	} catch (error) {
		console.error("Error generating answer:", error);
		throw new Error("Failed to generate answer from Gemini");
	}
}
