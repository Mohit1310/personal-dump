"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowRight, Brain, Loader, MessageSquare, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = [
	"What was that error I saw earlier?",
	"Summarize my recent notes",
	"How do I fix X in Y?",
];

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

export function ChatInterface() {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [inputValue, setInputValue] = useState("");

	const { messages, sendMessage, status, setMessages } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
		onError: (error: Error) => {
			console.error("Chat error:", error);
			toast.error("Query failed. Please try again.");
		},
	});

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSend = (text: string = inputValue) => {
		const query = text.trim();
		if (!query || status !== "ready") return;

		sendMessage({ text: query });
		setInputValue("");
	};

	const clearChat = () => {
		setMessages([]);
	};

	const isLoading = status === "streaming" || status === "submitted";

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
							<span className="text-border">|</span>
							<span>MODEL: GEMINI_FLASH</span>
						</div>
					</div>
				</div>
				<Button
					className="h-10 w-10 rounded-none hover:bg-destructive hover:text-white"
					onClick={clearChat}
					size="icon"
					title="Clear"
					variant="ghost"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
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
								className={`${msg.role === "user" ? "bg-primary text-primary-foreground" : ""} p-6 shadow-sm`}
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
										{/* Render message parts for streaming */}
										{msg.parts.map((part, index) => {
											if (part.type === "text") {
												return (
													<MessageResponse className="" key={index}>
														{part.text}
													</MessageResponse>
												);
											}
											// Handle other part types if needed
											return null;
										})}
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
							<div className="p-6 shadow-sm">
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
				<div className="swiss-card bg-background transition-all focus-within:border-primary focus-within:shadow-[4px_4px_0px_0px_var(--primary)]">
					<div className="flex gap-2 p-1">
						<Textarea
							className="max-h-[200px] min-h-[60px] flex-1 resize-none border-none bg-transparent pt-3 font-mono text-base shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend();
								}
							}}
							placeholder="Enter command or query..."
							value={inputValue}
						/>
						<div className="flex items-end pr-1 pb-1">
							<Button
								className="h-10 w-10 rounded-none bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
								disabled={isLoading || !inputValue.trim()}
								onClick={() => handleSend()}
								size="icon"
							>
								{isLoading ? (
									<Loader className="h-4 w-4 animate-spin" />
								) : (
									<ArrowRight className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</div>
				<div className="mt-3 text-center font-mono text-[10px] text-muted-foreground opacity-50">
					PERSONAL_DUMP_OS v1.0 • STREAMING ENABLED
				</div>
			</div>
		</div>
	);
}
