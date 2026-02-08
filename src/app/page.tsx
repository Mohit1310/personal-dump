import { ArrowRight, MessageSquare, NotebookPen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<main className="relative flex min-h-screen flex-col bg-background pt-20 text-foreground">
			{/* Grid Background */}
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-20" />

			<div className="container mx-auto max-w-5xl px-6 py-20">
				{/* Hero Section */}
				<div className="mb-24 flex flex-col gap-6">
					<div className="inline-block w-fit border border-border bg-muted/20 px-3 py-1 font-mono text-muted-foreground text-xs uppercase tracking-widest">
						v1.0.0 — Second Brain
					</div>

					<h1 className="font-bold font-sans text-6xl text-primary leading-[0.9] tracking-tighter sm:text-8xl">
						PERSONAL
						<br />
						<span className="text-muted-foreground">DUMP_</span>
					</h1>

					<p className="mt-4 max-w-xl font-light text-muted-foreground text-xl leading-relaxed">
						A minimalist vault for your messy thoughts, error logs, and code
						snippets.
						<strong className="font-medium text-foreground">
							{" "}
							Indexed by AI. Retrieved by Chat.
						</strong>
					</p>

					<div className="mt-4">
						<Link href="/dump">
							<Button
								className="h-14 cursor-pointer rounded-none bg-primary px-8 text-base text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
								size="lg"
							>
								Start Dumping <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>

				{/* Feature Grid */}
				<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
					{/* Knowledge Dump Card */}
					<Link className="group" href="/dump">
						<div className="swiss-card flex h-full min-h-[300px] flex-col justify-between p-8 hover:border-accent hover:shadow-[6px_6px_0px_0px_var(--accent)]">
							<div className="space-y-4">
								<div className="flex h-12 w-12 items-center justify-center border border-border bg-muted/20 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
									<NotebookPen className="h-6 w-6" />
								</div>
								<h3 className="font-bold text-2xl tracking-tight">
									Input Phase
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									Paste raw text, code blocks, or logs. We automatically chunk
									and vector-index everything.
								</p>
							</div>
							<div className="mt-8 flex items-center justify-between border-border border-t pt-4">
								<span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
									/dump
								</span>
								<ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
							</div>
						</div>
					</Link>

					{/* Chat Card */}
					<Link className="group" href="/chat">
						<div className="swiss-card flex h-full min-h-[300px] flex-col justify-between p-8 hover:border-accent hover:shadow-[6px_6px_0px_0px_var(--accent)]">
							<div className="space-y-4">
								<div className="flex h-12 w-12 items-center justify-center border border-border bg-muted/20 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
									<MessageSquare className="h-6 w-6" />
								</div>
								<h3 className="font-bold text-2xl tracking-tight">
									Query Phase
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									Ask questions. Get answers grounded in your data. Powered by
									Groq for speed.
								</p>
							</div>
							<div className="mt-8 flex items-center justify-between border-border border-t pt-4">
								<span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
									/chat
								</span>
								<ArrowRight className="h-5 w-5 -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
							</div>
						</div>
					</Link>
				</div>

				{/* Footer Meta */}
				<div className="mt-24 flex flex-wrap gap-8 border-border border-t pt-8 font-mono text-muted-foreground text-sm">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-foreground" />
						VECTOR_SEARCH_ENABLED
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-foreground" />
						RAG_OPTIMIZED
					</div>
				</div>
			</div>
		</main>
	);
}
