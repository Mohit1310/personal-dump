import { Suspense } from "react";
import { LibraryBrowser } from "@/components/library/library-browser";

function LibraryFallback() {
	return (
		<div
			aria-live="polite"
			className="grid gap-px border border-border bg-border"
			role="status"
		>
			<span className="sr-only">Loading library</span>
			{Array.from({ length: 3 }, (_, index) => (
				<div className="h-36 animate-pulse bg-muted/30 p-5" key={index} />
			))}
		</div>
	);
}

export default function LibraryPage() {
	return (
		<main className="relative min-h-screen bg-background pt-24 pb-12 text-foreground">
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-10" />
			<div className="container mx-auto max-w-5xl px-6">
				<Suspense fallback={<LibraryFallback />}>
					<LibraryBrowser />
				</Suspense>
			</div>
		</main>
	);
}
