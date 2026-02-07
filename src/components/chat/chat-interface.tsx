"use client";

import { useChat } from "@ai-sdk/react";
import type { SourceDocumentUIPart } from "ai";
import { DefaultChatTransport } from "ai";
import { Brain, Loader, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageResponse } from "@/components/ai-elements/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Button } from "@/components/ui/button";
import ChatInput from "./chat-input";

/** Extended source type with custom metadata from RAG chunks */
interface RAGSource extends SourceDocumentUIPart {
	providerMetadata?: {
		custom?: {
			content?: string;
			distance?: number;
			score?: number;
		};
	};
}

const SUGGESTIONS = [
	"What was that error I saw earlier?",
	"Summarize my recent notes",
	"How do I fix X in Y?",
];
const DEFAULT_MODEL = "qwen/qwen3-32b";

/**
 * Extracts text content from a message's parts
 */
function getMessageText(parts: Array<{ type: string; text?: string }>): string {
	for (const part of parts) {
		if (part.type === "text" && part.text) {
			return part.text;
		}
	}
	return "";
}

function splitCompletionOutput(raw: string) {
	if (!raw) {
		return { reasoning: "", message: "" };
	}

	const reasoningChunks: string[] = [];
	let message = raw.replace(
		/<think>([\s\S]*?)<\/think>/g,
		(_, chunk: string) => {
			const trimmed = chunk.trim();
			if (trimmed) {
				reasoningChunks.push(trimmed);
			}
			return "";
		},
	);

	const unclosedThink = message.match(/<think>([\s\S]*)$/);
	if (unclosedThink?.[1]) {
		const trimmed = unclosedThink[1].trim();
		if (trimmed) {
			reasoningChunks.push(trimmed);
		}
		message = message.replace(/<think>[\s\S]*$/, "");
	}

	message = message.replace(/<\/think>/g, "").trim();

	return {
		reasoning: reasoningChunks.join("\n\n").trim(),
		message,
	};
}

export function ChatInterface() {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [inputValue, setInputValue] = useState("");
	const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);

	const { messages, sendMessage, status, setMessages } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
		onError: (error: Error) => {
			console.error("Chat error:", error);
			toast.error("Query failed. Please try again.");
		},
	});

	const messageCount = messages.length;

	// Scroll to bottom when messages change
	useEffect(() => {
		if (messageCount === 0) return;
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messageCount]);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.code === "Slash") {
				event.preventDefault();
				setIsModelSelectorOpen(true);
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	const handleSend = (text: string = inputValue, modelId: string = DEFAULT_MODEL) => {
		const query = text.trim();
		if (!query || status !== "ready") return;

		sendMessage(
			{ text: query },
			{
				body: {
					model: modelId,
				},
			},
		);
		setInputValue("");
	};

	const clearChat = () => {
		setMessages([]);
	};

	return (
		<div className="mx-auto flex h-full max-w-5xl flex-col border-border border-x bg-background shadow-2xl">
			{/* Header */}
			<header className="z-10 flex items-center justify-between border-border border-b bg-background px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="bg-primary p-1.5 text-primary-foreground">
						<Brain className="h-4 w-4" />
					</div>
					<div>
						<h1 className="font-bold text-sm uppercase tracking-tight">
							Terminal Link
						</h1>
						<div className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
							<span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
							<span>STATUS: CONNECTED</span>
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						className="h-10 w-10 rounded-none hover:bg-destructive hover:text-white"
						onClick={clearChat}
						size="icon"
						title="Clear"
						variant="ghost"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</header>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-6 py-8">
				{messages.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center space-y-8 opacity-40 transition-opacity hover:opacity-100">
						<MessageSquare className="h-16 w-16 text-muted-foreground" />
						<div className="space-y-1 text-center">
							<h2 className="font-bold text-xl">AWAITING INPUT</h2>
							<p className="font-mono text-muted-foreground text-sm">
								Ask naturally. I will retrieve context.
							</p>
						</div>

						<div className="flex flex-wrap justify-center gap-2">
							{SUGGESTIONS.map((s) => (
								<button
									className="border border-border bg-muted/10 px-4 py-2 font-mono text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
									key={s}
									onClick={() => setInputValue(s)}
									type="button"
								>
									{s}
								</button>
							))}
						</div>
					</div>
				)}

				<div className="space-y-6">
					{messages.map((msg) => (
						<div
							className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
							key={msg.id}
						>
							<div
								className={`${msg.role === "user" ? "bg-primary text-primary-foreground" : ""} px-4 py-2 shadow-sm`}
							>
								{/* Content */}
								{msg.role === "user" ? (
									<div>
										{getMessageText(
											msg.parts as Array<{ type: string; text?: string }>,
										)}
									</div>
								) : (
									<>
										{/* Render text parts for streaming */}
										{(() => {
											const textContent = msg.parts
												.filter(
													(part): part is { type: "text"; text: string } =>
														part.type === "text" &&
														typeof part.text === "string",
												)
												.map((part) => part.text)
												.join("");
											const { reasoning, message } =
												splitCompletionOutput(textContent);
											const isCurrentStreamingMessage =
												status === "streaming" &&
												msg.id === messages[messages.length - 1]?.id;
											const hasThinkingMarkup = textContent.includes("<think>");

											return (
												<>
													{(reasoning ||
														(isCurrentStreamingMessage &&
															hasThinkingMarkup)) && (
														<Reasoning isStreaming={isCurrentStreamingMessage}>
															<ReasoningTrigger />
															<ReasoningContent>{reasoning}</ReasoningContent>
														</Reasoning>
													)}
													{message && (
														<MessageResponse>{message}</MessageResponse>
													)}
												</>
											);
										})()}

										{/* Render sources */}
										{(() => {
											const sources = msg.parts.filter(
												(p): p is RAGSource => p.type === "source-document",
											);
											if (sources.length === 0) return null;
											return (
												<Sources>
													<SourcesTrigger count={sources.length} />
													<SourcesContent>
														{sources.map((source, i) => (
															<div
																className="rounded-md border border-border bg-muted/50 p-3 text-xs"
																key={source.sourceId}
															>
																<div className="mb-1 flex justify-between font-semibold">
																	<span>
																		{source.title || `Source ${i + 1}`}
																	</span>
																	{source.providerMetadata?.custom?.score !==
																		undefined && (
																		<span className="opacity-50">
																			Score:{" "}
																			{source.providerMetadata.custom.score.toFixed(
																				3,
																			)}
																		</span>
																	)}
																</div>
																{source.providerMetadata?.custom?.content && (
																	<p className="line-clamp-3 text-muted-foreground">
																		{source.providerMetadata.custom.content}
																	</p>
																)}
															</div>
														))}
													</SourcesContent>
												</Sources>
											);
										})()}

										{/* Show loading indicator when streaming and no text yet */}
										{status === "streaming" &&
											msg.id === messages[messages.length - 1]?.id &&
											!msg.parts.some((p) => p.type === "text") && (
												<div className="flex items-center gap-2 font-mono text-sm">
													<Loader className="h-4 w-4 animate-spin" />
													<span>COMPUTING_RESPONSE...</span>
												</div>
											)}
									</>
								)}
							</div>
						</div>
					))}
					{/* Show loading placeholder when waiting for response */}
					{status === "submitted" && (
						<div className="flex justify-start">
							<div className="max-w-[85%] p-6 shadow-sm">
								<div className="flex items-center gap-2 font-mono text-sm">
									<Loader className="h-4 w-4 animate-spin" />
									<span>COMPUTING_RESPONSE...</span>
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input Area */}
			<div className="border-border border-t bg-background p-6">
				<ChatInput
					inputValue={inputValue}
					isModelSelectorOpen={isModelSelectorOpen}
					onModelSelectorOpenChange={setIsModelSelectorOpen}
					onInputChange={setInputValue}
					onSubmit={handleSend}
					status={status}
				/>
			</div>
		</div>
	);
}
