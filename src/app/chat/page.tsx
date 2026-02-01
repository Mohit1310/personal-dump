"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { LoadingDots } from "@/components/ui/loading-dots";
import { toast } from "sonner";
import { Send, Sparkles, MessageSquare, Trash2 } from "lucide-react";

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
		<main className="flex h-screen bg-background overflow-hidden relative">
			{/* Dynamic background decoration */}
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-custom/10 rounded-full blur-[128px] pointer-events-none" />

			<div className="flex flex-col w-full max-w-4xl mx-auto border-x border-border/50 relative bg-background/50 backdrop-blur-3xl shadow-2xl">
				{/* Header */}
				<header className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-primary/10">
							<Sparkles className="w-5 h-5 text-primary" />
						</div>
						<div>
							<h1 className="font-bold tracking-tight">Knowledge Chat</h1>
							<div className="flex items-center gap-1.5">
								<div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
								<span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
									Online
								</span>
							</div>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={clearChat}
						title="Clear Chat"
					>
						<Trash2 className="w-4 h-4 text-muted-foreground" />
					</Button>
				</header>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
					{messages.length <= 1 && (
						<div className="flex flex-col items-center justify-center h-full space-y-6 opacity-60">
							<div className="p-6 rounded-full bg-muted/50 border border-border">
								<MessageSquare className="w-12 h-12 text-muted-foreground" />
							</div>
							<div className="text-center space-y-2">
								<h2 className="text-xl font-semibold">
									Start searching your knowledge
								</h2>
								<p className="text-sm text-muted-foreground">
									Ask questions about your notes, errors, and solutions.
								</p>
							</div>
							<div className="flex flex-wrap justify-center gap-2 max-w-md">
								{SUGGESTIONS.map((s) => (
									<button
										key={s}
										type="button"
										onClick={() => void handleSend(s)}
										className="px-4 py-2 rounded-full border border-border bg-muted/30 hover:bg-muted/80 text-xs transition-all hover:scale-105"
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
								<div className="flex w-full mb-6 gap-4 animate-in fade-in">
									<div className="flex h-8 w-8 items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
										<Sparkles className="h-4 w-4" />
									</div>
									<div className="flex flex-col gap-2 max-w-[85%] lg:max-w-[70%]">
										<div className="rounded-2xl px-4 py-3 bg-muted border border-border text-foreground shadow-sm">
											<LoadingDots />
										</div>
									</div>
								</div>
							) : (
								<ChatBubble
									role={msg.role}
									content={msg.content}
									sources={msg.sources}
								/>
							)}
						</div>
					))}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="p-6 border-t border-border/50 bg-background/80 backdrop-blur-md">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							void handleSend();
						}}
						className="relative"
					>
						<div className="absolute -inset-1 bg-linear-to-r from-primary to-accent-custom rounded-2xl blur opacity-20" />
						<div className="relative flex items-center bg-card border border-border px-2 py-2 rounded-xl shadow-lg focus-within:border-primary/50 transition-colors">
							<Input
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Ask your knowledge..."
								className="border-none shadow-none focus-visible:ring-0 text-base py-6 bg-transparent"
								autoFocus
							/>
							<Button
								type="submit"
								size="icon"
								disabled={isLoading || !input.trim()}
								className="h-10 w-10 shrink-0 rounded-lg shadow-md transition-transform active:scale-95"
							>
								<Send className="w-4 h-4" />
							</Button>
						</div>
						<p className="text-[10px] text-center mt-3 text-muted-foreground font-medium uppercase tracking-tighter opacity-50">
							Powered by RAG & Gemini AI
						</p>
					</form>
				</div>
			</div>
		</main>
	);
}
