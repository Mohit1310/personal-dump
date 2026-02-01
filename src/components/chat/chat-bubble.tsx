"use client";

import { Bot, ChevronDown, ChevronUp, User } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface Source {
	id: string;
	content: string;
	distance: number;
}

interface ChatBubbleProps {
	role: "user" | "assistant";
	content: string;
	sources?: Source[];
}

export function ChatBubble({ role, content, sources }: ChatBubbleProps) {
	const [showSources, setShowSources] = useState(false);
	const isAssistant = role === "assistant";

	return (
		<div
			className={cn(
				"fade-in slide-in-from-bottom-2 mb-6 flex w-full animate-in gap-4",
				isAssistant ? "justify-start" : "flex-row-reverse justify-end",
			)}
		>
			<div
				className={cn(
					"flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm",
					isAssistant
						? "bg-primary text-primary-foreground"
						: "bg-background text-foreground",
				)}
			>
				{isAssistant ? (
					<Bot className="h-4 w-4" />
				) : (
					<User className="h-4 w-4" />
				)}
			</div>
			<div
				className={cn(
					"flex max-w-[85%] flex-col gap-2 lg:max-w-[70%]",
					isAssistant ? "items-start" : "items-end",
				)}
			>
				<div
					className={cn(
						"rounded-2xl px-4 py-3 shadow-sm",
						isAssistant
							? "border border-border bg-muted text-foreground"
							: "bg-primary",
					)}
				>
					<div className="prose prose-sm dark:prose-invert max-w-none">
						{isAssistant ? (
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{content}
							</ReactMarkdown>
						) : (
							<p className="whitespace-pre-wrap text-primary-foreground">
								{content}
							</p>
						)}
					</div>
				</div>

				{isAssistant && sources && sources.length > 0 && (
					<div className="mt-2 w-full">
						<button
							className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
							onClick={() => setShowSources(!showSources)}
							type="button"
						>
							{showSources ? (
								<ChevronUp className="h-3 w-3" />
							) : (
								<ChevronDown className="h-3 w-3" />
							)}
							{showSources
								? "Hide Sources"
								: `Show Sources (${sources.length})`}
						</button>
						{showSources && (
							<div className="fade-in slide-in-from-top-1 mt-2 animate-in space-y-2">
								{sources.map((source, i) => (
									<div
										className="rounded-md border border-border bg-muted/50 p-2 text-[11px] leading-relaxed"
										key={source.id}
									>
										<div className="mb-1 flex justify-between font-semibold">
											<span>Source {i + 1}</span>
											<span className="opacity-50">
												Score: {(1 - source.distance).toFixed(3)}
											</span>
										</div>
										<p className="line-clamp-3 text-muted-foreground">
											{source.content}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
