import {
	MessageSquare,
	NotebookPen,
	Search,
	Shield,
	Sparkles,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground">
			{/* Decorative background elements */}
			<div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_50%_0%,rgba(46,2,109,0.15),transparent_50%)]" />
			<div className="pointer-events-none absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
			<div className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-accent-custom/10 blur-[100px]" />

			<div className="fade-in slide-in-from-bottom-8 container relative z-10 flex animate-in flex-col items-center justify-center gap-12 px-4 py-16 text-center duration-1000">
				<div className="space-y-4">
					<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-bold text-primary text-xs uppercase tracking-widest">
						<Sparkles className="h-3 w-3" />
						Your Second Brain
					</div>
					<h1 className="font-extrabold text-6xl tracking-tight sm:text-[5rem] lg:text-[6rem]">
						Personal <span className="text-primary">Dump</span>
					</h1>
					<p className="mx-auto max-w-2xl text-muted-foreground text-xl leading-relaxed">
						Storage for your messy thoughts, error logs, and code snippets.
						Organized by AI, retrieved through a simple chat interface.
					</p>
				</div>

				<div className="grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
					<Link className="group" href="/dump">
						<div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-border/50 bg-card p-8 text-left shadow-xl transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-2xl hover:shadow-primary/5">
							<div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
								<NotebookPen className="h-24 w-24 rotate-12" />
							</div>
							<div className="w-fit rounded-2xl bg-primary/10 p-3">
								<NotebookPen className="h-6 w-6 text-primary" />
							</div>
							<div>
								<h3 className="mb-2 font-bold text-2xl">Knowledge Dump</h3>
								<p className="text-muted-foreground">
									Paste your raw text, code, or logs. We'll chunk and index it
									using vector embeddings.
								</p>
							</div>
						</div>
					</Link>

					<Link className="group" href="/chat">
						<div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-border/50 bg-card p-8 text-left shadow-xl transition-all hover:border-primary/50 hover:bg-muted/50 hover:shadow-2xl hover:shadow-primary/5">
							<div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
								<MessageSquare className="h-24 w-24 -rotate-12" />
							</div>
							<div className="w-fit rounded-2xl bg-accent-custom/10 p-3">
								<MessageSquare className="h-6 w-6 text-accent-custom" />
							</div>
							<div>
								<h3 className="mb-2 font-bold text-2xl">AI Chat</h3>
								<p className="text-muted-foreground">
									Ask questions and get answers grounded in your personal data.
									Powered by Gemini 2.5 Flash.
								</p>
							</div>
						</div>
					</Link>
				</div>

				<div className="mt-8 flex w-full max-w-4xl flex-wrap justify-center gap-8 border-border/50 border-t py-8 text-muted-foreground/60">
					<div className="flex items-center gap-2 font-medium text-sm">
						<Search className="h-4 w-4" />
						Vector Search
					</div>
					<div className="flex items-center gap-2 font-medium text-sm">
						<Zap className="h-4 w-4" />
						Real-time RAG
					</div>
					<div className="flex items-center gap-2 font-medium text-sm">
						<Shield className="h-4 w-4" />
						Private Storage
					</div>
				</div>

				<Link href="/dump">
					<Button
						className="h-14 rounded-full bg-primary px-10 text-primary-foreground shadow-primary/20 shadow-xl transition-transform hover:scale-105"
						size="lg"
					>
						Get Started
					</Button>
				</Link>
			</div>
		</main>
	);
}
