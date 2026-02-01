"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { User, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
				"flex w-full mb-6 gap-4 animate-in fade-in slide-in-from-bottom-2",
				isAssistant ? "justify-start" : "justify-end flex-row-reverse",
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
					"flex flex-col gap-2 max-w-[85%] lg:max-w-[70%]",
					isAssistant ? "items-start" : "items-end",
				)}
			>
				<div
					className={cn(
						"rounded-2xl px-4 py-3 shadow-sm",
						isAssistant
							? "bg-muted text-foreground border border-border"
							: "bg-primary text-primary-foreground",
					)}
				>
					<div className="prose prose-sm dark:prose-invert max-w-none">
						{isAssistant ? (
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{content}
							</ReactMarkdown>
						) : (
							<p className="whitespace-pre-wrap">{content}</p>
						)}
					</div>
				</div>

				{isAssistant && sources && sources.length > 0 && (
					<div className="mt-2 w-full">
						<button
							onClick={() => setShowSources(!showSources)}
							className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
							<div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
								{sources.map((source, i) => (
									<div
										key={source.id}
										className="p-2 rounded-md bg-muted/50 border border-border text-[11px] leading-relaxed"
									>
										<div className="font-semibold mb-1 flex justify-between">
											<span>Source {i + 1}</span>
											<span className="opacity-50">
												Score: {(1 - source.distance).toFixed(3)}
											</span>
										</div>
										<p className="text-muted-foreground line-clamp-3">
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
