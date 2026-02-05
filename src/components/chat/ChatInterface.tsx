"use client";

import { MessageSquare, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader } from "@/components/ai-elements/loader";
import {
	Message,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	PromptInput,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Button } from "@/components/ui/button";

interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	sources?: { id: string; content: string; distance: number }[];
	isLoading?: boolean;
}

const SUGGESTIONS = [
	"What was that error I saw earlier?",
	"Summarize my recent notes",
	"How do I fix X in Y?",
];

export function ChatInterface() {
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			id: "initial",
			role: "assistant",
			content:
				"Hello! I'm your personal knowledge assistant. Ask me anything about your stored dumps.",
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const handleSend = async (text: string = input) => {
		const query = text.trim();
		if (!query || isLoading) return;

		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: "user",
			content: query,
		};

		const assistantPlaceholder: ChatMessage = {
			id: crypto.randomUUID(),
			role: "assistant",
			content: "",
			isLoading: true,
		};

		setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
		setInput("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/search", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
			});

			if (!response.ok) {
				throw new Error("Failed to fetch answer");
			}

			const data = await response.json();

			setMessages((prev) =>
				prev.map((msg) =>
					msg.id === assistantPlaceholder.id
						? {
								...msg,
								content: data.answer,
								sources: data.sources,
								isLoading: false,
							}
						: msg,
				),
			);
		} catch (error) {
			console.error(error);
			toast.error("Failed to get an answer. Please try again.");
			setMessages((prev) =>
				prev.filter((msg) => msg.id !== assistantPlaceholder.id),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const clearChat = () => {
		setMessages([
			{
				id: "initial",
				role: "assistant",
				content: "Chat cleared. Ask me something else!",
			},
		]);
	};

	return (
		<div className="relative mx-auto flex w-full max-w-4xl flex-col border-border/50 border-x bg-background/50 shadow-2xl backdrop-blur-3xl">
			{/* Header */}
			<header className="sticky top-0 z-10 flex items-center justify-between border-border/50 border-b bg-background/80 px-6 py-4 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2">
						<Sparkles className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="font-bold tracking-tight">Knowledge Chat</h1>
						<div className="flex items-center gap-1.5">
							<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
							<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
								Online
							</span>
						</div>
					</div>
				</div>
				<Button
					onClick={clearChat}
					size="icon-sm"
					title="Clear Chat"
					variant="ghost"
				>
					<Trash2 className="h-4 w-4 text-muted-foreground" />
				</Button>
			</header>

			{/* Messages */}
			<div className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent flex-1 overflow-y-auto p-6">
				{messages.length <= 1 && (
					<div className="flex flex-col items-center justify-center space-y-6 opacity-60">
						<div className="rounded-full border border-border bg-muted/50 p-6">
							<MessageSquare className="h-12 w-12 text-muted-foreground" />
						</div>
						<div className="space-y-2 text-center">
							<h2 className="font-semibold text-xl">
								Start searching your knowledge
							</h2>
							<p className="text-muted-foreground text-sm">
								Ask questions about your notes, errors, and solutions.
							</p>
						</div>
						<Suggestions className="max-w-md justify-center">
							{SUGGESTIONS.map((s) => (
								<Suggestion
									key={s}
									onClick={(suggestion) => setInput(suggestion)}
									suggestion={s}
								/>
							))}
						</Suggestions>
					</div>
				)}

				{messages.map((msg) => (
					<div className="py-3" key={msg.id}>
						<Message from={msg.role}>
							<MessageContent>
								{msg.isLoading ? (
									<div className="flex items-center gap-2 py-2">
										<Loader size={16} />
										<span className="text-muted-foreground text-sm">
											Thinking...
										</span>
									</div>
								) : msg.role === "assistant" ? (
									<MessageResponse>{msg.content}</MessageResponse>
								) : (
									<p className="whitespace-pre-wrap">{msg.content}</p>
								)}
							</MessageContent>

							{/* Sources for assistant messages */}
							{msg.role === "assistant" &&
								msg.sources &&
								msg.sources.length > 0 && (
									<Sources>
										<SourcesTrigger count={msg.sources.length} />
										<SourcesContent>
											{msg.sources.map((source, i) => (
												<Source key={source.id} title={`Source ${i + 1}`}>
													<span className="line-clamp-2 text-muted-foreground text-xs">
														{source.content}
													</span>
												</Source>
											))}
										</SourcesContent>
									</Sources>
								)}
						</Message>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="border-border/50 border-t bg-background/80 p-6 backdrop-blur-md">
				<div className="relative">
					<div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary to-accent-custom opacity-5 blur" />
					<PromptInput
						className="relative rounded-xl border border-border bg-card shadow-lg"
						onSubmit={(message) => {
							void handleSend(message.text);
						}}
					>
						<PromptInputTextarea
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask your knowledge..."
							value={input}
						/>
						<PromptInputFooter>
							<PromptInputTools />
							<PromptInputSubmit disabled={isLoading || !input.trim()} />
						</PromptInputFooter>
					</PromptInput>
					<p className="mt-3 text-center font-medium text-[10px] text-muted-foreground uppercase tracking-tighter opacity-50">
						Powered by RAG & Gemini AI
					</p>
				</div>
			</div>
		</div>
	);
}
