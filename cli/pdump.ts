#!/usr/bin/env node

import { pathToFileURL } from "node:url";

export const usage = 'Usage: pnpm pdump add --text "text to store"';

type DumpResponse = {
	chunksCreated?: number;
	dumpId?: string;
	error?: string;
	message?: string;
	success?: boolean;
};

export function parseArgs(args: string[]) {
	if (args.includes("--help") || args.includes("-h")) return { help: true as const };
	if (args.length !== 3 || args[0] !== "add" || args[1] !== "--text") {
		throw new Error(usage);
	}
	if (!args[2]?.trim()) throw new Error("Text cannot be empty.");
	return { content: args[2] };
}

type CliDependencies = {
	fetch: typeof globalThis.fetch;
	log: (message: string) => void;
	error: (message: string) => void;
	baseUrl?: string;
};

export async function runCli(
	args: string[],
	{
		fetch: fetchImpl = globalThis.fetch,
		log = console.log,
		error = console.error,
		baseUrl = process.env.PERSONAL_DUMP_URL ?? "http://localhost:3000",
	}: Partial<CliDependencies> = {},
) {
	try {
		const parsed = parseArgs(args);
		if (parsed.help) {
			log(usage);
			return 0;
		}

		const endpoint = new URL("/api/dump", baseUrl);
		const response = await fetchImpl(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: parsed.content }),
		});
		const result = (await response.json().catch(() => null)) as DumpResponse | null;

		if (!response.ok) {
			throw new Error(result?.message ?? result?.error ?? `Request failed (${response.status})`);
		}

		log(`Stored dump ${result?.dumpId ?? "successfully"} (${result?.chunksCreated ?? 0} chunks).`);
		return 0;
	} catch (errorValue: unknown) {
		const message = errorValue instanceof Error ? errorValue.message : "Unknown error";
		error(`pdump: ${message}`);
		return 1;
	}
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
	runCli(process.argv.slice(2)).then((exitCode) => {
		process.exitCode = exitCode;
	});
}
