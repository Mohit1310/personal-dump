import type { DumpType } from "@/lib/dump-metadata";

export interface DumpSummary {
	id: string;
	title: string;
	type: DumpType;
	tags: string[];
	source: string;
	createdAt: string;
	updatedAt: string;
}

export interface LibraryResponse {
	dumps: DumpSummary[];
	pagination: {
		page: number;
		pageSize: number;
		total: number;
		totalPages: number;
	};
}
