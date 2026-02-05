import { AlertTriangle, Code, FileText, Terminal } from "lucide-react";
import { DumpForm } from "@/components/dump/DumpForm";

export default function DumpPage() {
	return (
		<main className="relative min-h-screen bg-background pt-24 pb-12 text-foreground">
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-10" />

			<div className="container mx-auto max-w-4xl px-6">
				{/* Header */}
				<div className="mb-12 border-primary border-l-4 pl-6">
					<h1 className="mb-2 font-bold text-5xl tracking-tighter">
						KNOWLEDGE DUMP
					</h1>
					<p className="font-light text-muted-foreground text-xl">
						Ingest mode. Log your data for future retrieval.
					</p>
				</div>

				{/* Quick Legend */}
				<div className="mb-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-3">
					<div className="flex items-center gap-3 bg-background p-4">
						<FileText className="h-5 w-5 text-muted-foreground" />
						<div>
							<div className="font-bold text-sm">Note</div>
							<div className="text-muted-foreground text-xs">
								General context
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3 bg-background p-4">
						<Code className="h-5 w-5 text-muted-foreground" />
						<div>
							<div className="font-bold text-sm">Snippet</div>
							<div className="text-muted-foreground text-xs">
								reusable logic
							</div>
						</div>
					</div>
					<div className="flex items-center gap-3 bg-background p-4">
						<AlertTriangle className="h-5 w-5 text-muted-foreground" />
						<div>
							<div className="font-bold text-sm">Error</div>
							<div className="text-muted-foreground text-xs">Debug trace</div>
						</div>
					</div>
				</div>

				<DumpForm />

				<div className="mt-8 flex items-center justify-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-widest opacity-50">
					<Terminal className="h-3 w-3" />
					<span>Cmd + Enter to Submit</span>
				</div>
			</div>
		</main>
	);
}
