import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	NotebookPen,
	MessageSquare,
	Sparkles,
	Shield,
	Zap,
	Search,
} from "lucide-react";

export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
			{/* Decorative background elements */}
			<div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(46,2,109,0.15),transparent_50%)] pointer-events-none" />
			<div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
			<div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-custom/10 rounded-full blur-[100px] pointer-events-none" />

			<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
				<div className="space-y-4">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
						<Sparkles className="w-3 h-3" />
						Your Second Brain
					</div>
					<h1 className="text-6xl font-extrabold tracking-tight sm:text-[5rem] lg:text-[6rem]">
						Personal <span className="text-primary">Dump</span>
					</h1>
					<p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
						Storage for your messy thoughts, error logs, and code snippets.
						Organized by AI, retrieved through a simple chat interface.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 w-full max-w-3xl">
					<Link href="/dump" className="group">
						<div className="flex flex-col gap-4 rounded-3xl bg-card border border-border/50 p-8 text-left transition-all hover:bg-muted/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden shadow-xl h-full">
							<div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
								<NotebookPen className="w-24 h-24 rotate-12" />
							</div>
							<div className="p-3 rounded-2xl bg-primary/10 w-fit">
								<NotebookPen className="w-6 h-6 text-primary" />
							</div>
							<div>
								<h3 className="text-2xl font-bold mb-2">Knowledge Dump</h3>
								<p className="text-muted-foreground">
									Paste your raw text, code, or logs. We'll chunk and index it
									using vector embeddings.
								</p>
							</div>
						</div>
					</Link>

					<Link href="/chat" className="group">
						<div className="flex flex-col gap-4 rounded-3xl bg-card border border-border/50 p-8 text-left transition-all hover:bg-muted/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden shadow-xl h-full">
							<div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
								<MessageSquare className="w-24 h-24 -rotate-12" />
							</div>
							<div className="p-3 rounded-2xl bg-accent-custom/10 w-fit">
								<MessageSquare className="w-6 h-6 text-accent-custom" />
							</div>
							<div>
								<h3 className="text-2xl font-bold mb-2">AI Chat</h3>
								<p className="text-muted-foreground">
									Ask questions and get answers grounded in your personal data.
									Powered by Gemini 2.5 Flash.
								</p>
							</div>
						</div>
					</Link>
				</div>

				<div className="flex flex-wrap justify-center gap-8 mt-8 py-8 border-t border-border/50 w-full max-w-4xl text-muted-foreground/60">
					<div className="flex items-center gap-2 text-sm font-medium">
						<Search className="w-4 h-4" />
						Vector Search
					</div>
					<div className="flex items-center gap-2 text-sm font-medium">
						<Zap className="w-4 h-4" />
						Real-time RAG
					</div>
					<div className="flex items-center gap-2 text-sm font-medium">
						<Shield className="w-4 h-4" />
						Private Storage
					</div>
				</div>

				<Link href="/dump">
					<Button
						size="lg"
						className="rounded-full px-10 h-14 bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-xl shadow-primary/20"
					>
						Get Started
					</Button>
				</Link>
			</div>
		</main>
	);
}
