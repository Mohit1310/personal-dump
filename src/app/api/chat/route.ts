// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { env } from "@/env";
import { embedQuery } from "@/lib/embeddings/embed-query";
import { type SearchResult, vectorSearch } from "@/lib/retrieval/vector-search";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// const model = createGoogleGenerativeAI({
// 	apiKey: env.GEMINI_API_KEY,
// });

const model = createGroq({
	apiKey: env.GROQ_API_KEY,
});

/**
 * Builds a RAG system prompt with retrieved context chunks.
 */
function buildSystemPrompt(chunks: SearchResult[]): string {
	if (chunks.length === 0) {
		return `You are a helpful AI assistant. The user is asking about their personal dump of notes, code, and documents, but no relevant context was found. Politely let them know you couldn't find relevant information.`;
	}

	const contextBlock = chunks
		.slice(0, 8)
		.map((chunk, i) => `[Chunk ${i + 1}]\n${chunk.content}`)
		.join("\n---\n");

	return `
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
}

/**
 * Extracts text content from a UIMessage's parts
 */
function getMessageText(msg: UIMessage): string {
	for (const part of msg.parts) {
		if (part.type === "text") {
			return part.text;
		}
	}
	return "";
}

export async function POST(req: Request) {
	try {
		const { messages }: { messages: UIMessage[] } = await req.json();

		// Get the last user message for RAG retrieval
		const lastUserMessage = [...messages]
			.reverse()
			.find((m) => m.role === "user");
		const query = lastUserMessage ? getMessageText(lastUserMessage) : "";

		// Perform vector search for RAG context
		let chunks: SearchResult[] = [];
		if (query) {
			try {
				const queryVector = await embedQuery(query);
				chunks = await vectorSearch(queryVector, 8);
			} catch (error) {
				console.error("RAG retrieval failed:", error);
				// Continue without context if retrieval fails
			}
		}

		// Stream response using AI SDK
		const result = streamText({
			model: model("openai/gpt-oss-120b"),
			system: buildSystemPrompt(chunks),
			messages: await convertToModelMessages(messages),
		});

		return result.toUIMessageStreamResponse({
			sendSources: true,
		});
	} catch (error) {
		console.error("Chat API Error:", error);
		return new Response(
			JSON.stringify({
				error: "Chat failed",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}
