"use client";

import { Check, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const DUMP_TYPES = [
	{ value: "note", label: "Note", char: "N" },
	{ value: "error", label: "Error", char: "E" },
	{ value: "solution", label: "Solution", char: "S" },
] as const;

export function DumpForm() {
	const [content, setContent] = useState("");
	const [type, setType] = useState<"note" | "error" | "solution">("note");
	const [isLoading, setIsLoading] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	const handleSave = async () => {
		if (!content.trim()) {
			toast.error("Please enter some content");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/dump", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content, type }),
			});

			if (!response.ok) {
				throw new Error("Failed to save dump");
			}

			setShowSuccess(true);
			setTimeout(() => setShowSuccess(false), 2000);
			toast.success("Knowledge stored successfully!");
			setContent("");
		} catch (error) {
			console.error(error);
			toast.error("Failed to store knowledge");
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			void handleSave();
		}
	};

	return (
		<div className="swiss-card overflow-hidden bg-card p-0">
			{/* Toolbar */}
			<div className="flex items-center gap-4 border-border border-b bg-muted/20 p-4">
				<span className="mr-2 font-mono text-muted-foreground text-xs uppercase tracking-widest">
					DATA_TYPE:
				</span>
				<div className="flex gap-2">
					{DUMP_TYPES.map((t) => (
						<button
							className={`border px-4 py-1.5 font-medium text-sm transition-all${
								type === t.value
									? "border-primary bg-primary text-primary-foreground"
									: "border-border bg-background text-muted-foreground hover:border-sidebar-foreground"
							}
							`}
							key={t.value}
							onClick={() => setType(t.value)}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			{/* Editor */}
			<Textarea
				className="min-h-[400px] w-full resize-none rounded-none border-none bg-transparent p-6 font-mono text-base leading-relaxed placeholder:text-muted-foreground/30 focus-visible:ring-0"
				disabled={isLoading}
				onChange={(e) => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="// Input stream ready...
// Paste snippets, logs, or notes here."
				value={content}
			/>

			{/* Footer Actions */}
			<div className="flex items-center justify-between border-border border-t bg-muted/10 p-4">
				<div className="font-mono text-muted-foreground text-xs">
					CHARS: {content.length}
				</div>

				<Button
					className={`h-12 rounded-none px-8 font-medium transition-all${showSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary hover:bg-primary/90"}
					`}
					disabled={isLoading || !content.trim()}
					onClick={handleSave}
				>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : showSuccess ? (
						<Check className="mr-2 h-4 w-4" />
					) : (
						<Send className="mr-2 h-4 w-4" />
					)}
					{isLoading ? "PROCESSING" : showSuccess ? "SAVED" : "DUMP DATA"}
				</Button>
			</div>
		</div>
	);
}
