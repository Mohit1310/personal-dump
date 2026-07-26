import { LibraryDetail } from "@/components/library/library-detail";

export default async function LibraryDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return (
		<main className="relative min-h-screen bg-background pt-24 pb-12 text-foreground">
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-10" />
			<div className="container mx-auto max-w-5xl px-6">
				<LibraryDetail dumpId={id} />
			</div>
		</main>
	);
}
