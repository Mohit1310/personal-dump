"use client";

import {
	AlertTriangle,
	ArrowLeft,
	Loader2,
	RefreshCw,
	Save,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type DumpType = "note" | "error" | "solution";

type Dump = {
	id: string;
	content: string;
	title: string;
	type: DumpType;
	tags: string[];
	source: string;
	createdAt: string;
	updatedAt: string;
};

type EditableMetadata = Pick<Dump, "title" | "type" | "source"> & {
	tags: string;
};

const typeLabel: Record<DumpType, string> = {
	note: "Note",
	error: "Error",
	solution: "Solution",
};

const typeBadgeVariant: Record<
	DumpType,
	"secondary" | "destructive" | "default"
> = {
	note: "secondary",
	error: "destructive",
	solution: "default",
};

const formatTimestamp = (value: string) =>
	new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

const metadataFor = (dump: Dump): EditableMetadata => ({
	title: dump.title,
	type: dump.type,
	tags: dump.tags.join(", "),
	source: dump.source,
});

const responseError = async (response: Response, fallback: string) => {
	try {
		const body = (await response.json()) as { error?: string };
		return body.error ?? fallback;
	} catch {
		return fallback;
	}
};

export function LibraryDetail({ dumpId }: { dumpId: string }) {
	const [dump, setDump] = useState<Dump | null>(null);
	const [metadata, setMetadata] = useState<EditableMetadata | null>(null);
	const [content, setContent] = useState("");
	const [loadError, setLoadError] = useState<string | null>(null);
	const [notFound, setNotFound] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSavingMetadata, setIsSavingMetadata] = useState(false);
	const [isReindexing, setIsReindexing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [metadataError, setMetadataError] = useState<string | null>(null);
	const [contentError, setContentError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [retryKey, setRetryKey] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		setIsLoading(true);
		setLoadError(null);
		setNotFound(false);

		void fetch(`/api/dumps/${dumpId}`, { signal: controller.signal })
			.then(async (response) => {
				if (response.status === 404) {
					setNotFound(true);
					return;
				}
				if (!response.ok) {
					throw new Error(
						await responseError(response, "Could not load this dump."),
					);
				}
				const body = (await response.json()) as { dump: Dump };
				setDump(body.dump);
				setMetadata(metadataFor(body.dump));
				setContent(body.dump.content);
			})
			.catch((error: unknown) => {
				if (error instanceof DOMException && error.name === "AbortError")
					return;
				setLoadError(
					error instanceof Error ? error.message : "Could not load this dump.",
				);
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoading(false);
			});

		return () => controller.abort();
	}, [dumpId, retryKey]);

	const hasMetadataChanges = useMemo(
		() =>
			Boolean(
				dump &&
				metadata &&
				JSON.stringify(metadata) !== JSON.stringify(metadataFor(dump)),
			),
		[dump, metadata],
	);
	const hasContentChanges = Boolean(dump && content !== dump.content);
	const hasUnsavedChanges = hasMetadataChanges || hasContentChanges;

	useEffect(() => {
		const warnBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!hasUnsavedChanges) return;
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", warnBeforeUnload);
		return () => window.removeEventListener("beforeunload", warnBeforeUnload);
	}, [hasUnsavedChanges]);

	const saveMetadata = async () => {
		if (!metadata) return;
		setMetadataError(null);
		setIsSavingMetadata(true);
		try {
			const response = await fetch(`/api/dumps/${dumpId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: metadata.title,
					type: metadata.type,
					tags: metadata.tags.split(",").filter((tag) => tag.trim()),
					source: metadata.source,
				}),
			});
			if (!response.ok) {
				throw new Error(
					await responseError(response, "Could not save metadata."),
				);
			}
			const nextDump = ((await response.json()) as { dump: Dump }).dump;
			setDump(nextDump);
			setMetadata(metadataFor(nextDump));
		} catch (error) {
			setMetadataError(
				error instanceof Error ? error.message : "Could not save metadata.",
			);
		} finally {
			setIsSavingMetadata(false);
		}
	};

	const reindexContent = async () => {
		if (!content.trim()) {
			setContentError("Content is required before it can be re-indexed.");
			return;
		}
		setContentError(null);
		setIsReindexing(true);
		try {
			const response = await fetch(`/api/dumps/${dumpId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content }),
			});
			if (!response.ok) {
				throw new Error(
					await responseError(response, "Could not re-index content."),
				);
			}
			const nextDump = ((await response.json()) as { dump: Dump }).dump;
			setDump(nextDump);
			setContent(nextDump.content);
		} catch (error) {
			setContentError(
				error instanceof Error ? error.message : "Could not re-index content.",
			);
		} finally {
			setIsReindexing(false);
		}
	};

	const deleteDump = async () => {
		setDeleteError(null);
		setIsDeleting(true);
		try {
			const response = await fetch(`/api/dumps/${dumpId}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error(
					await responseError(response, "Could not delete this dump."),
				);
			}
			window.location.assign("/library");
		} catch (error) {
			setDeleteError(
				error instanceof Error ? error.message : "Could not delete this dump.",
			);
			setIsDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<div
				aria-live="polite"
				className="grid gap-px border border-border bg-border"
				role="status"
			>
				<span className="sr-only">Loading dump details</span>
				<div className="h-32 animate-pulse bg-muted/30" />
				<div className="h-96 animate-pulse bg-muted/30" />
			</div>
		);
	}

	if (notFound) {
		return (
			<DetailNotice
				title="Dump not found"
				description="This stored item may have been deleted."
			/>
		);
	}

	if (loadError || !dump || !metadata) {
		return (
			<DetailNotice
				action={
					<Button
						className="rounded-none"
						onClick={() => setRetryKey((key) => key + 1)}
					>
						<RefreshCw />
						Retry
					</Button>
				}
				description={loadError ?? "The dump could not be loaded."}
				title="Could not load this dump"
			/>
		);
	}

	return (
		<>
			<header className="mb-8 border-primary border-l-4 pl-6">
				<Link
					className="mb-4 inline-flex items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-widest hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
					href="/library"
				>
					<ArrowLeft className="h-4 w-4" /> Back to library
				</Link>
				<div className="flex flex-wrap items-center gap-3">
					<Badge
						className="rounded-none font-mono uppercase tracking-wider"
						variant={typeBadgeVariant[dump.type]}
					>
						{typeLabel[dump.type]}
					</Badge>
					{hasUnsavedChanges && (
						<span className="font-mono text-accent text-xs uppercase tracking-widest">
							Unsaved changes
						</span>
					)}
				</div>
				<h1 className="mt-3 break-words font-bold text-4xl tracking-tighter sm:text-5xl">
					{dump.title.trim() ||
						`Untitled ${typeLabel[dump.type].toLowerCase()}`}
				</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground">
					Inspect the stored source, update its metadata, or deliberately
					replace its indexed content.
				</p>
			</header>

			<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="space-y-8">
					<section
						aria-labelledby="content-heading"
						className="swiss-card overflow-hidden"
					>
						<div className="flex flex-wrap items-center justify-between gap-3 border-border border-b bg-muted/20 p-4">
							<div>
								<h2 className="font-bold text-xl" id="content-heading">
									Stored content
								</h2>
								<p className="mt-1 text-muted-foreground text-sm">
									Changes take effect only after re-indexing.
								</p>
							</div>
							{hasContentChanges && (
								<span className="font-mono text-accent text-xs uppercase tracking-widest">
									Not indexed
								</span>
							)}
						</div>
						<div className="p-4 sm:p-6">
							<label className="sr-only" htmlFor="dump-content">
								Dump content
							</label>
							<Textarea
								className="min-h-96 resize-y rounded-none bg-background font-mono leading-relaxed"
								id="dump-content"
								onChange={(event) => setContent(event.target.value)}
								value={content}
							/>
							{contentError && (
								<p
									className="mt-3 font-mono text-destructive text-sm"
									role="alert"
								>
									{contentError}
								</p>
							)}
							<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
								<span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
									{content.length} characters
								</span>
								<Button
									className="rounded-none"
									disabled={isReindexing || !hasContentChanges}
									onClick={reindexContent}
									type="button"
								>
									{isReindexing ? (
										<Loader2 className="animate-spin" />
									) : (
										<RefreshCw />
									)}
									{isReindexing ? "Re-indexing content" : "Re-index content"}
								</Button>
							</div>
						</div>
					</section>

					<section
						aria-labelledby="metadata-heading"
						className="swiss-card p-5 sm:p-6"
					>
						<div className="mb-5">
							<h2 className="font-bold text-xl" id="metadata-heading">
								Metadata
							</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								These fields describe the dump without changing its indexed
								content.
							</p>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="Title" id="dump-title">
								<Input
									className="rounded-none"
									id="dump-title"
									onChange={(event) =>
										setMetadata(
											(current) =>
												current && { ...current, title: event.target.value },
										)
									}
									value={metadata.title}
								/>
							</Field>
							<Field label="Type" id="dump-type">
								<select
									className="h-9 w-full rounded-none border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
									id="dump-type"
									onChange={(event) =>
										setMetadata(
											(current) =>
												current && {
													...current,
													type: event.target.value as DumpType,
												},
										)
									}
									value={metadata.type}
								>
									<option value="note">Note</option>
									<option value="error">Error</option>
									<option value="solution">Solution</option>
								</select>
							</Field>
							<Field label="Tags" id="dump-tags">
								<Input
									className="rounded-none"
									id="dump-tags"
									onChange={(event) =>
										setMetadata(
											(current) =>
												current && { ...current, tags: event.target.value },
										)
									}
									placeholder="database, prisma"
									value={metadata.tags}
								/>
							</Field>
							<Field label="Source" id="dump-source">
								<Input
									className="rounded-none"
									id="dump-source"
									onChange={(event) =>
										setMetadata(
											(current) =>
												current && { ...current, source: event.target.value },
										)
									}
									value={metadata.source}
								/>
							</Field>
						</div>
						<p className="mt-2 text-muted-foreground text-xs">
							Separate tags with commas.
						</p>
						{metadataError && (
							<p
								className="mt-3 font-mono text-destructive text-sm"
								role="alert"
							>
								{metadataError}
							</p>
						)}
						<div className="mt-5 flex justify-end">
							<Button
								className="rounded-none"
								disabled={isSavingMetadata || !hasMetadataChanges}
								onClick={saveMetadata}
								type="button"
							>
								{isSavingMetadata ? (
									<Loader2 className="animate-spin" />
								) : (
									<Save />
								)}
								{isSavingMetadata ? "Saving metadata" : "Save metadata"}
							</Button>
						</div>
					</section>
				</div>

				<aside className="space-y-6">
					<section aria-labelledby="record-heading" className="swiss-card p-5">
						<h2 className="font-bold text-lg" id="record-heading">
							Record
						</h2>
						<dl className="mt-4 space-y-4 font-mono text-xs">
							<div>
								<dt className="text-muted-foreground uppercase tracking-widest">
									Created
								</dt>
								<dd className="mt-1">{formatTimestamp(dump.createdAt)}</dd>
							</div>
							<div>
								<dt className="text-muted-foreground uppercase tracking-widest">
									Last updated
								</dt>
								<dd className="mt-1">{formatTimestamp(dump.updatedAt)}</dd>
							</div>
						</dl>
					</section>
					<section
						aria-labelledby="danger-heading"
						className="border border-destructive/50 p-5"
					>
						<h2
							className="font-bold text-destructive text-lg"
							id="danger-heading"
						>
							Danger zone
						</h2>
						<p className="mt-2 text-muted-foreground text-sm">
							Deleting removes this dump and its derived index permanently.
						</p>
						<Button
							className="mt-4 rounded-none"
							onClick={() => {
								setDeleteError(null);
								setDeleteOpen(true);
							}}
							type="button"
							variant="destructive"
						>
							<Trash2 />
							Delete dump
						</Button>
					</section>
				</aside>
			</div>

			<Dialog
				onOpenChange={(open) => {
					setDeleteOpen(open);
					if (!open) setDeleteConfirmation("");
				}}
				open={deleteOpen}
			>
				<DialogContent className="rounded-none" showCloseButton={!isDeleting}>
					<DialogHeader>
						<DialogTitle>Delete this dump?</DialogTitle>
						<DialogDescription>
							This permanently removes the content and its derived index. Type
							DELETE to enable the final action.
						</DialogDescription>
					</DialogHeader>
					<label
						className="grid gap-2 font-mono text-muted-foreground text-xs uppercase tracking-widest"
						htmlFor="delete-confirmation"
					>
						Confirmation
						<Input
							autoFocus
							autoComplete="off"
							className="rounded-none text-foreground normal-case"
							disabled={isDeleting}
							id="delete-confirmation"
							onChange={(event) => setDeleteConfirmation(event.target.value)}
							value={deleteConfirmation}
						/>
					</label>
					{deleteError && (
						<p className="font-mono text-destructive text-sm" role="alert">
							{deleteError}
						</p>
					)}
					<DialogFooter>
						<Button
							className="rounded-none"
							disabled={isDeleting}
							onClick={() => setDeleteOpen(false)}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
						<Button
							className="rounded-none"
							disabled={isDeleting || deleteConfirmation !== "DELETE"}
							onClick={deleteDump}
							type="button"
							variant="destructive"
						>
							{isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
							{isDeleting ? "Deleting dump" : "Delete permanently"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

function Field({
	children,
	id,
	label,
}: {
	children: React.ReactNode;
	id: string;
	label: string;
}) {
	return (
		<div className="grid gap-1.5">
			<label
				className="font-mono text-muted-foreground text-xs uppercase tracking-widest"
				htmlFor={id}
			>
				{label}
			</label>
			{children}
		</div>
	);
}

function DetailNotice({
	action,
	description,
	title,
}: {
	action?: React.ReactNode;
	description: string;
	title: string;
}) {
	return (
		<section
			aria-labelledby="detail-notice-title"
			className="swiss-card flex flex-col items-start gap-4 p-8"
			role="alert"
		>
			<AlertTriangle className="h-7 w-7 text-destructive" />
			<div>
				<h1 className="font-bold text-xl" id="detail-notice-title">
					{title}
				</h1>
				<p className="mt-1 text-muted-foreground">{description}</p>
			</div>
			{action ?? (
				<Button asChild className="rounded-none">
					<Link href="/library">
						<ArrowLeft />
						Back to library
					</Link>
				</Button>
			)}
		</section>
	);
}
