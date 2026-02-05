import { NotebookPen } from "lucide-react";
import { DumpForm } from "@/components/dump/DumpForm";

export default function DumpPage() {
	return (
		<main className="flex min-h-screen flex-col items-center bg-background px-4 py-12 text-foreground">
			<div className="fade-in slide-in-from-bottom-4 w-full max-w-4xl animate-in space-y-8 duration-700">
				<div className="space-y-2 text-center">
					<div className="mb-2 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3">
						<NotebookPen className="h-8 w-8 text-primary" />
					</div>
					<h1 className="font-bold text-4xl tracking-tight">Dump Knowledge</h1>
					<p className="mx-auto max-w-lg text-muted-foreground">
						Paste anything you want to remember—notes, code snippets, or error
						logs. We'll chunk it and index it for your chat assistant.
					</p>
				</div>

				<DumpForm />
			</div>
		</main>
	);
}
