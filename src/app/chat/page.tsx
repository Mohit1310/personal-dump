"use client";

import { MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingDots } from "@/components/ui/loading-dots";

interface Message {
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

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([
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
	}, [messages]);

	const handleSend = async (text: string = input) => {
		const query = text.trim();
		if (!query || isLoading) return;

		const userMessage: Message = {
			id: crypto.randomUUID(),
			role: "user",
			content: query,
		};

		const assistantPlaceholder: Message = {
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
		<main className="relative flex h-screen overflow-hidden bg-background">
			{/* Dynamic background decoration */}
			<div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[128px]" />
			<div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent-custom/10 blur-[128px]" />

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
						<div className="flex h-full flex-col items-center justify-center space-y-6 opacity-60">
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
							<div className="flex max-w-md flex-wrap justify-center gap-2">
								{SUGGESTIONS.map((s) => (
									<button
										className="rounded-full border border-border bg-muted/30 px-4 py-2 text-xs transition-all hover:scale-105 hover:bg-muted/80"
										key={s}
										onClick={() => void handleSend(s)}
										type="button"
									>
										{s}
									</button>
								))}
							</div>
						</div>
					)}

					{messages.map((msg) => (
						<div key={msg.id}>
							{msg.isLoading ? (
								<div className="fade-in mb-6 flex w-full animate-in gap-4">
									<div className="flex h-8 w-8 items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
										<Sparkles className="h-4 w-4" />
									</div>
									<div className="flex max-w-[85%] flex-col gap-2 lg:max-w-[70%]">
										<div className="rounded-2xl border border-border bg-muted px-4 py-3 text-foreground shadow-sm">
											<LoadingDots />
										</div>
									</div>
								</div>
							) : (
								<ChatBubble
									content={msg.content}
									role={msg.role}
									sources={msg.sources}
								/>
							)}
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="border-border/50 border-t bg-background/80 p-6 backdrop-blur-md">
					<form
						className="relative"
						onSubmit={(e) => {
							e.preventDefault();
							void handleSend();
						}}
					>
						<div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary to-accent-custom opacity-20 blur" />
						<div className="relative flex items-center rounded-xl border border-border bg-card px-2 py-2 shadow-lg transition-colors focus-within:border-primary/50">
							<Input
								autoFocus
								className="border-none bg-transparent py-6 text-base shadow-none focus-visible:ring-0"
								onChange={(e) => setInput(e.target.value)}
								placeholder="Ask your knowledge..."
								value={input}
							/>
							<Button
								className="h-10 w-10 shrink-0 rounded-lg shadow-md transition-transform active:scale-95"
								disabled={isLoading || !input.trim()}
								size="icon"
								type="submit"
							>
								<Send className="h-4 w-4" />
							</Button>
						</div>
						<p className="mt-3 text-center font-medium text-[10px] text-muted-foreground uppercase tracking-tighter opacity-50">
							Powered by RAG & Gemini AI
						</p>
					</form>
				</div>
			</div>
		</main>
	);
}
