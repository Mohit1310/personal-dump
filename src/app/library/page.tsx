import { LibraryBrowser } from "@/components/library/library-browser";

export default function LibraryPage() {
	return (
		<main className="relative min-h-screen bg-background pt-24 pb-12 text-foreground">
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-10" />
			<div className="container mx-auto max-w-5xl px-6">
				<LibraryBrowser />
			</div>
		</main>
	);
}
