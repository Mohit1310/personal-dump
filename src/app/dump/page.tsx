"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send, NotebookPen } from "lucide-react";

export default function DumpPage() {
	const [content, setContent] = useState("");
	const [type, setType] = useState<"note" | "error" | "solution">("note");
	const [isLoading, setIsLoading] = useState(false);

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
		<main className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4">
			<div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<div className="space-y-2 text-center">
					<div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-2">
						<NotebookPen className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-4xl font-bold tracking-tight">Dump Knowledge</h1>
					<p className="text-muted-foreground max-w-lg mx-auto">
						Paste anything you want to remember—notes, code snippets, or error
						logs. We'll chunk it and index it for your chat assistant.
					</p>
				</div>

				<div className="relative group">
					<div className="absolute -inset-0.5 bg-linear-to-r from-primary to-accent-custom rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
					<div className="relative bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden backdrop-blur-sm">
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Paste your knowledge here... (Cmd/Ctrl + Enter to save)"
							className="min-h-[400px] border-none focus-visible:ring-0 p-6 text-lg bg-transparent resize-none"
							disabled={isLoading}
						/>

						<div className="border-t border-border/50 p-4 bg-muted/30 flex items-center justify-between gap-4">
							<div className="flex items-center gap-2">
								<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
									Type:
								</span>
								<select
									value={type}
									onChange={(e) => setType(e.target.value as typeof type)}
									className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-primary transition-colors"
									disabled={isLoading}
								>
									<option value="note">Note</option>
									<option value="error">Error</option>
									<option value="solution">Solution</option>
								</select>
							</div>

							<div className="flex items-center gap-4">
								<span className="text-xs text-muted-foreground hidden sm:inline">
									{content.length > 0 ? `${content.length} characters` : ""}
								</span>
								<Button
									onClick={handleSave}
									disabled={isLoading}
									className="gap-2 px-6 shadow-lg shadow-primary/20"
								>
									{isLoading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Send className="w-4 h-4" />
									)}
									{isLoading ? "Saving..." : "Save Dump"}
								</Button>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					{[
						{ label: "Quick Note", desc: "Fleeting thoughts" },
						{ label: "Code Snippet", desc: "Reference logic" },
						{ label: "Error Log", desc: "Debugging context" },
					].map((item) => (
						<div
							key={item.label}
							className="p-4 rounded-xl border border-border/50 bg-card/50 text-center text-sm"
						>
							<div className="font-semibold">{item.label}</div>
							<div className="text-muted-foreground text-xs">{item.desc}</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
