"use client";

import {
	AlertTriangle,
	ArrowLeft,
	ArrowRight,
	Database,
	RefreshCw,
	Search,
	Tag,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { DumpType } from "@/lib/dump-metadata";
import type { DumpSummary, LibraryResponse } from "@/lib/library-contract";

const SEARCH_DEBOUNCE_MS = 300;

type SearchFields = Pick<LibraryFilters, "q" | "tag" | "source">;

type LibraryFilters = {
	q: string;
	type: DumpType | "";
	tag: string;
	source: string;
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

const getFilters = (searchParams: URLSearchParams): LibraryFilters => ({
	q: searchParams.get("q") ?? "",
	type: (searchParams.get("type") as DumpType | null) ?? "",
	tag: searchParams.get("tag") ?? "",
	source: searchParams.get("source") ?? "",
});

const formatTimestamp = (value: string) =>
	new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));

const summaryTitle = (dump: DumpSummary) =>
	dump.title.trim() || `Untitled ${typeLabel[dump.type].toLowerCase()}`;

export function LibraryBrowser() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		q: urlQuery,
		tag: urlTag,
		source: urlSource,
		type: urlType,
	} = getFilters(searchParams);
	const [filters, setFilters] = useState({
		q: urlQuery,
		tag: urlTag,
		source: urlSource,
		type: urlType,
	});
	const [data, setData] = useState<LibraryResponse | null>(null);
	const [error, setError] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [retryKey, setRetryKey] = useState(0);

	const replaceParams = useCallback(
		(changes: Partial<LibraryFilters> & { page?: number }) => {
			const next = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(changes)) {
				if (value === "" || value === undefined) {
					next.delete(key);
				} else {
					next.set(key, String(value));
				}
			}
			const query = next.toString();
			router.replace(query ? `${pathname}?${query}` : pathname, {
				scroll: false,
			});
		},
		[pathname, router, searchParams],
	);

	useEffect(() => {
		setFilters({
			q: urlQuery,
			tag: urlTag,
			source: urlSource,
			type: urlType,
		});
	}, [urlQuery, urlSource, urlTag, urlType]);

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			const current = getFilters(searchParams);
			if (
				filters.q !== current.q ||
				filters.tag !== current.tag ||
				filters.source !== current.source
			) {
				replaceParams({
					q: filters.q,
					tag: filters.tag,
					source: filters.source,
					page: 1,
				});
			}
		}, SEARCH_DEBOUNCE_MS);

		return () => window.clearTimeout(timeout);
	}, [filters.q, filters.source, filters.tag, replaceParams, searchParams]);

	useEffect(() => {
		const controller = new AbortController();
		setIsLoading(true);
		setError(false);

		void fetch(`/api/dumps?${searchParams.toString()}`, {
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) throw new Error("Failed to load library");
				return (await response.json()) as LibraryResponse;
			})
			.then((response) => setData(response))
			.catch((fetchError: unknown) => {
				if (
					fetchError instanceof DOMException &&
					fetchError.name === "AbortError"
				) {
					return;
				}
				setError(true);
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoading(false);
			});

		return () => controller.abort();
	}, [retryKey, searchParams]);

	const updateSearchField = (field: keyof SearchFields, value: string) =>
		setFilters((current) => ({ ...current, [field]: value }));

	const updateType = (type: DumpType | "") => {
		setFilters((current) => ({ ...current, type }));
		replaceParams({ type, page: 1 });
	};

	const clearFilters = () => {
		setFilters({ q: "", type: "", tag: "", source: "" });
		replaceParams({ q: "", type: "", tag: "", source: "", page: 1 });
	};

	const hasFilters = Boolean(
		filters.q || filters.type || filters.tag || filters.source,
	);
	const pagination = data?.pagination;

	return (
		<>
			<header className="mb-8 border-primary border-l-4 pl-6">
				<p className="mb-2 font-mono text-muted-foreground text-xs uppercase tracking-widest">
					Knowledge index / browse mode
				</p>
				<h1 className="font-bold text-5xl tracking-tighter sm:text-6xl">
					LIBRARY
				</h1>
				<p className="mt-3 max-w-2xl font-light text-muted-foreground text-lg">
					Search and inspect every stored note, error, and solution.
				</p>
			</header>

			<section
				aria-label="Library filters"
				className="swiss-card mb-8 p-4 sm:p-5"
			>
				<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem]">
					<div className="relative block">
						<label className="sr-only" htmlFor="library-search">
							Search library
						</label>
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							className="h-11 rounded-none pl-10"
							id="library-search"
							onChange={(event) => updateSearchField("q", event.target.value)}
							placeholder="Search titles and stored knowledge..."
							value={filters.q}
						/>
					</div>
					<div className="grid gap-1.5 font-mono text-muted-foreground text-xs uppercase tracking-widest">
						<label htmlFor="library-type">Type</label>
						<Select
							onValueChange={(value) =>
								updateType(value === "all" ? "" : (value as DumpType))
							}
							value={filters.type || "all"}
						>
							<SelectTrigger
								aria-label="Filter by type"
								className="h-11 w-full rounded-none bg-background text-foreground"
								id="library-type"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All types</SelectItem>
								<SelectItem value="note">Note</SelectItem>
								<SelectItem value="error">Error</SelectItem>
								<SelectItem value="solution">Solution</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
					<div className="grid gap-1.5 font-mono text-muted-foreground text-xs uppercase tracking-widest">
						<label htmlFor="library-tag">Tag</label>
						<Input
							className="h-10 rounded-none"
							id="library-tag"
							onChange={(event) => updateSearchField("tag", event.target.value)}
							placeholder="e.g. database-setup"
							value={filters.tag}
						/>
					</div>
					<div className="grid gap-1.5 font-mono text-muted-foreground text-xs uppercase tracking-widest">
						<label htmlFor="library-source">Source</label>
						<Input
							className="h-10 rounded-none"
							id="library-source"
							onChange={(event) =>
								updateSearchField("source", event.target.value)
							}
							placeholder="e.g. shell history"
							value={filters.source}
						/>
					</div>
					<Button
						className="self-end rounded-none"
						disabled={!hasFilters}
						onClick={clearFilters}
						type="button"
						variant="outline"
					>
						Clear filters
					</Button>
				</div>
			</section>

			<div
				aria-live="polite"
				className="mb-4 flex min-h-6 items-center justify-between font-mono text-muted-foreground text-xs uppercase tracking-widest"
			>
				<span>
					{isLoading
						? "Loading index"
						: pagination
							? `${pagination.total} stored items`
							: "Loading index"}
				</span>
				{pagination && pagination.totalPages > 0 && (
					<span>
						Page {pagination.page} / {pagination.totalPages}
					</span>
				)}
			</div>

			{isLoading && !data ? (
				<div
					aria-live="polite"
					className="grid gap-px border border-border bg-border"
					role="status"
				>
					<span className="sr-only">Loading library results</span>
					{Array.from({ length: 3 }, (_, index) => (
						<div className="h-36 animate-pulse bg-muted/30 p-5" key={index} />
					))}
				</div>
			) : error ? (
				<section
					aria-labelledby="library-error-title"
					className="swiss-card flex flex-col items-start gap-4 p-8"
					role="alert"
				>
					<AlertTriangle className="h-7 w-7 text-destructive" />
					<div>
						<h2 className="font-bold text-xl" id="library-error-title">
							Could not load the library
						</h2>
						<p className="mt-1 text-muted-foreground">
							The knowledge index is unavailable. Try the request again.
						</p>
					</div>
					<Button
						className="rounded-none"
						onClick={() => setRetryKey((key) => key + 1)}
						type="button"
					>
						<RefreshCw /> Retry
					</Button>
				</section>
			) : data?.dumps.length === 0 ? (
				<section className="swiss-card flex flex-col items-start gap-4 p-8">
					<Database className="h-7 w-7 text-muted-foreground" />
					<div>
						<h2 className="font-bold text-xl">
							{hasFilters ? "No matching knowledge" : "Your library is empty"}
						</h2>
						<p className="mt-1 text-muted-foreground">
							{hasFilters
								? "Change or clear a filter to broaden the results."
								: "Add a dump to begin building your searchable index."}
						</p>
					</div>
					{hasFilters ? (
						<Button
							className="rounded-none"
							onClick={clearFilters}
							type="button"
							variant="outline"
						>
							Show all items
						</Button>
					) : (
						<Button asChild className="rounded-none">
							<Link href="/dump">Add a dump</Link>
						</Button>
					)}
				</section>
			) : (
				<>
					<div className="grid gap-px border border-border bg-border">
						{data?.dumps.map((dump) => (
							<Link
								className="group block bg-card p-5 transition-colors hover:bg-muted/50 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-ring"
								href={`/library/${dump.id}`}
								key={dump.id}
							>
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div className="min-w-0">
										<div className="mb-2 flex flex-wrap items-center gap-2">
											<Badge
												className="rounded-none font-mono uppercase tracking-wider"
												variant={typeBadgeVariant[dump.type]}
											>
												{typeLabel[dump.type]}
											</Badge>
											{dump.tags.map((tag) => (
												<Badge
													className="rounded-none font-mono text-[10px]"
													key={tag}
													variant="outline"
												>
													<Tag className="h-3 w-3" /> {tag}
												</Badge>
											))}
										</div>
										<h2 className="truncate font-bold text-xl tracking-tight group-hover:text-accent">
											{summaryTitle(dump)}
										</h2>
										<p className="mt-1 truncate font-mono text-muted-foreground text-xs">
											SOURCE: {dump.source.trim() || "Unspecified"}
										</p>
									</div>
									<div className="shrink-0 border-border border-l-2 pl-4 font-mono text-muted-foreground text-xs leading-relaxed">
										<div>CREATED: {formatTimestamp(dump.createdAt)}</div>
										<div>UPDATED: {formatTimestamp(dump.updatedAt)}</div>
									</div>
								</div>
							</Link>
						))}
					</div>

					{pagination && pagination.totalPages > 1 && (
						<nav
							aria-label="Library pagination"
							className="mt-6 flex items-center justify-between border-border border-t pt-4"
						>
							<Button
								className="rounded-none"
								disabled={pagination.page === 1}
								onClick={() => replaceParams({ page: pagination.page - 1 })}
								type="button"
								variant="outline"
							>
								<ArrowLeft /> Previous
							</Button>
							<span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
								Page {pagination.page} of {pagination.totalPages}
							</span>
							<Button
								className="rounded-none"
								disabled={pagination.page === pagination.totalPages}
								onClick={() => replaceParams({ page: pagination.page + 1 })}
								type="button"
								variant="outline"
							>
								Next <ArrowRight />
							</Button>
						</nav>
					)}
				</>
			)}
		</>
	);
}
