"use client";

import { Database, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { PromptInputHeader } from "@/components/ai-elements/prompt-input";
import { DUMP_TYPES, type DumpType } from "@/lib/dump-metadata";
import type { LibraryResponse } from "@/lib/library-contract";
import type { RetrievalFilters } from "@/lib/retrieval/filters";

interface KnowledgeScopeControlsProps {
	filters: RetrievalFilters;
	onChange: (filters: RetrievalFilters) => void;
}

type ScopeOptions = {
	tags: string[];
	sources: string[];
};

const scopeLabel = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1);

export function KnowledgeScopeControls({
	filters,
	onChange,
}: KnowledgeScopeControlsProps) {
	const [options, setOptions] = useState<ScopeOptions>({
		tags: [],
		sources: [],
	});
	const [status, setStatus] = useState<"loading" | "ready" | "error">(
		"loading",
	);

	useEffect(() => {
		const controller = new AbortController();

		const loadPage = async (page = 1) => {
			const response = await fetch(
				`/api/dumps?pageSize=100${page > 1 ? `&page=${page}` : ""}`,
				{ signal: controller.signal },
			);
			if (!response.ok) {
				throw new Error(`Failed to load scope options (${response.status})`);
			}
			return (await response.json()) as LibraryResponse;
		};

		const loadOptions = async () => {
			try {
				const firstPage = await loadPage();
				const remainingPages = await Promise.all(
					Array.from(
						{
							length: Math.max(0, (firstPage.pagination?.totalPages ?? 1) - 1),
						},
						(_, index) => loadPage(index + 2),
					),
				);
				const dumps = [
					...firstPage.dumps,
					...remainingPages.flatMap(({ dumps: pageDumps }) => pageDumps),
				];
				const sources = dumps.flatMap((dump) => {
					const source = dump.source.trim();
					return source ? [source] : [];
				});

				setOptions({
					tags: [...new Set(dumps.flatMap((dump) => dump.tags))].sort(),
					sources: [...new Set(sources)].sort((a, b) => a.localeCompare(b)),
				});
				setStatus("ready");
			} catch (error) {
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
				console.error("Failed to load knowledge scope options:", error);
				setStatus("error");
			}
		};

		void loadOptions();
		return () => controller.abort();
	}, []);

	const updateFilter = (
		field: keyof RetrievalFilters,
		value: DumpType | string,
	) => {
		const next = { ...filters };
		if (value) {
			next[field] = value as never;
		} else {
			delete next[field];
		}
		onChange(next);
	};

	const activeFilterCount = Object.keys(filters).length;

	return (
		<PromptInputHeader className="border-border border-b px-3 py-2">
			<div aria-label="Knowledge scope" className="w-full" role="group">
				<div className="mb-2 flex items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2">
						<Database className="size-3.5 shrink-0 text-accent" />
						<span className="font-mono text-[0.65rem] text-muted-foreground uppercase tracking-widest">
							Scope
						</span>
						<span
							aria-live="polite"
							className="truncate font-mono text-[0.65rem]"
						>
							{activeFilterCount === 0
								? "All knowledge"
								: `${activeFilterCount} active`}
						</span>
					</div>
					<button
						className="shrink-0 font-mono text-[0.65rem] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
						disabled={activeFilterCount === 0}
						onClick={() => onChange({})}
						type="button"
					>
						Clear scope
					</button>
				</div>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
					<label className="grid min-w-0 gap-1 font-mono text-[0.6rem] text-muted-foreground uppercase tracking-wider">
						Type
						<select
							aria-label="Knowledge type scope"
							className="h-8 min-w-0 border border-border bg-background px-2 font-mono text-xs text-foreground focus-visible:outline-2 focus-visible:outline-ring"
							onChange={(event) =>
								updateFilter("type", event.target.value as DumpType)
							}
							value={filters.type ?? ""}
						>
							<option value="">All types</option>
							{DUMP_TYPES.map((type) => (
								<option key={type} value={type}>
									{scopeLabel(type)}
								</option>
							))}
						</select>
					</label>
					<label className="grid min-w-0 gap-1 font-mono text-[0.6rem] text-muted-foreground uppercase tracking-wider">
						Tag
						<select
							aria-label="Knowledge tag scope"
							className="h-8 min-w-0 border border-border bg-background px-2 font-mono text-xs text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
							disabled={status !== "ready" || options.tags.length === 0}
							onChange={(event) => updateFilter("tag", event.target.value)}
							value={filters.tag ?? ""}
						>
							<option value="">
								{status === "loading"
									? "Loading tags..."
									: status === "error"
										? "Tags unavailable"
										: options.tags.length === 0
											? "No tags available"
											: "All tags"}
							</option>
							{options.tags.map((tag) => (
								<option key={tag} value={tag}>
									{tag}
								</option>
							))}
						</select>
					</label>
					<label className="col-span-2 grid min-w-0 gap-1 font-mono text-[0.6rem] text-muted-foreground uppercase tracking-wider sm:col-span-1">
						Source
						<select
							aria-label="Knowledge source scope"
							className="h-8 min-w-0 border border-border bg-background px-2 font-mono text-xs text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
							disabled={status !== "ready" || options.sources.length === 0}
							onChange={(event) => updateFilter("source", event.target.value)}
							value={filters.source ?? ""}
						>
							<option value="">
								{status === "loading"
									? "Loading sources..."
									: status === "error"
										? "Sources unavailable"
										: options.sources.length === 0
											? "No sources available"
											: "All sources"}
							</option>
							{options.sources.map((source) => (
								<option key={source} value={source}>
									{source}
								</option>
							))}
						</select>
					</label>
				</div>
				{status !== "ready" && (
					<p
						aria-live="polite"
						className="mt-2 flex items-center gap-1.5 font-mono text-[0.6rem] text-muted-foreground"
					>
						{status === "loading" && (
							<LoaderCircle className="size-3 animate-spin" />
						)}
						{status === "loading"
							? "Loading saved tags and sources. Unfiltered chat is ready."
							: "Saved tags and sources are unavailable. Unfiltered chat still works."}
					</p>
				)}
			</div>
		</PromptInputHeader>
	);
}
