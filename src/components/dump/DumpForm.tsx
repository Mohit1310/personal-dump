"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function DumpForm() {
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
		<>
			<div className="group relative">
				<div className="absolute -inset-0.5 rounded-xl bg-linear-to-r from-primary to-accent-custom opacity-20 blur transition duration-1000 group-hover:opacity-30"></div>
				<div className="relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-2xl backdrop-blur-sm">
					<Textarea
						className="min-h-[400px] resize-none border-none bg-transparent p-6 text-lg focus-visible:ring-0"
						disabled={isLoading}
						onChange={(e) => setContent(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Paste your knowledge here... (Cmd/Ctrl + Enter to save)"
						value={content}
					/>

					<div className="flex items-center justify-between gap-4 border-border/50 border-t bg-muted/30 p-4">
						<div className="flex items-center gap-2">
							<span className="px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
								Type:
							</span>
							<select
								className="cursor-pointer bg-transparent font-medium text-sm transition-colors hover:text-primary focus:outline-none"
								disabled={isLoading}
								onChange={(e) => setType(e.target.value as typeof type)}
								value={type}
							>
								<option value="note">Note</option>
								<option value="error">Error</option>
								<option value="solution">Solution</option>
							</select>
						</div>

						<div className="flex items-center gap-4">
							<span className="hidden text-muted-foreground text-xs sm:inline">
								{content.length > 0 ? `${content.length} characters` : ""}
							</span>
							<Button
								className="gap-2 px-6 shadow-lg shadow-primary/20"
								disabled={isLoading}
								onClick={handleSave}
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
								{isLoading ? "Saving..." : "Save Dump"}
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[
					{ label: "Quick Note", desc: "Fleeting thoughts" },
					{ label: "Code Snippet", desc: "Reference logic" },
					{ label: "Error Log", desc: "Debugging context" },
				].map((item) => (
					<div
						className="rounded-xl border border-border/50 bg-card/50 p-4 text-center text-sm"
						key={item.label}
					>
						<div className="font-semibold">{item.label}</div>
						<div className="text-muted-foreground text-xs">{item.desc}</div>
					</div>
				))}
			</div>
		</>
	);
}
