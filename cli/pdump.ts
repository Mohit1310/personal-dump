#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { readFileInput, readStdinInput } from "./input.js";

export const usage =
	"Usage: pnpm pdump add (--text <text> | --file <path> | --stdin) [--title <text>] [--type <note|error|solution>] [--tag <tag>] [--source <label>]";

type DumpType = "note" | "error" | "solution";

type Metadata = {
	source?: string;
	tags?: string[];
	title?: string;
	type?: DumpType;
};

type ParsedArgs =
	| { help: true }
	| ({ sourceKind: "text"; content: string } & Metadata)
	| ({ sourceKind: "file"; filePath: string } & Metadata)
	| ({ sourceKind: "stdin" } & Metadata);

type DumpResponse = {
	chunksCreated?: number;
	dumpId?: string;
	error?: string;
	success?: boolean;
};

function sourceLooksAbsolute(source: string) {
	return /^(?:[\\/]|[A-Za-z]:[\\/]|\/\/)/.test(source);
}

function requireValue(args: string[], index: number, flag: string) {
	const value = args[index + 1];
	if (value === undefined || value.startsWith("--")) {
		throw new Error(`Option ${flag} requires a value.`);
	}
	return value;
}

export function parseArgs(args: string[]): ParsedArgs {
	if (args.includes("--help") || args.includes("-h")) return { help: true };
	if (args[0] !== "add") {
		throw new Error(usage);
	}

	let content: string | undefined;
	let filePath: string | undefined;
	let useStdin = false;
	const metadata: Metadata = {};
	const singletonFlags = new Set<string>();

	for (let index = 1; index < args.length; index += 1) {
		const flag = args[index];
		if (!flag?.startsWith("--"))
			throw new Error("Unexpected positional argument.");

		if (flag === "--stdin") {
			if (useStdin)
				throw new Error("Option --stdin may only be supplied once.");
			useStdin = true;
			continue;
		}

		if (
			flag !== "--text" &&
			flag !== "--file" &&
			flag !== "--title" &&
			flag !== "--type" &&
			flag !== "--tag" &&
			flag !== "--source"
		) {
			throw new Error("Unknown option.");
		}

		if (flag !== "--tag") {
			if (singletonFlags.has(flag)) {
				throw new Error(`Option ${flag} may only be supplied once.`);
			}
			singletonFlags.add(flag);
		}

		const value = requireValue(args, index, flag);
		index += 1;

		switch (flag) {
			case "--text":
				content = value;
				break;
			case "--file":
				filePath = value;
				break;
			case "--title":
				metadata.title = value;
				break;
			case "--type":
				if (value !== "note" && value !== "error" && value !== "solution") {
					throw new Error("Type must be note, error, or solution.");
				}
				metadata.type = value;
				break;
			case "--tag":
				(metadata.tags ??= []).push(value);
				break;
			case "--source":
				if (sourceLooksAbsolute(value)) {
					throw new Error("Source must not be an absolute path.");
				}
				metadata.source = value;
				break;
		}
	}

	const sourceCount =
		Number(content !== undefined) +
		Number(filePath !== undefined) +
		Number(useStdin);
	if (sourceCount !== 1)
		throw new Error("Exactly one input source is required.");
	if (content !== undefined) {
		if (!content.trim()) throw new Error("Text cannot be empty.");
		return { sourceKind: "text", content, ...metadata };
	}
	if (filePath !== undefined)
		return { sourceKind: "file", filePath, ...metadata };
	return { sourceKind: "stdin", ...metadata };
}

type CliDependencies = {
	fetch: typeof globalThis.fetch;
	log: (message: string) => void;
	error: (message: string) => void;
	baseUrl?: string;
	readFile: (filePath: string) => Promise<string>;
	readStdin: () => Promise<string>;
};

export async function runCli(
	args: string[],
	{
		fetch: fetchImpl = globalThis.fetch,
		log = console.log,
		error = console.error,
		baseUrl = process.env.PERSONAL_DUMP_URL ?? "http://localhost:3000",
		readFile = readFileInput,
		readStdin = readStdinInput,
	}: Partial<CliDependencies> = {},
) {
	try {
		const parsed = parseArgs(args);
		if ("help" in parsed) {
			log(usage);
			return 0;
		}

		const content =
			parsed.sourceKind === "text"
				? parsed.content
				: parsed.sourceKind === "file"
					? await readFile(parsed.filePath)
					: await readStdin();
		const metadata: Metadata = {
			...(parsed.title === undefined ? {} : { title: parsed.title }),
			...(parsed.type === undefined ? {} : { type: parsed.type }),
			...(parsed.tags === undefined ? {} : { tags: parsed.tags }),
			...(parsed.source === undefined ? {} : { source: parsed.source }),
		};
		const body = {
			content,
			...(parsed.sourceKind === "file"
				? { title: parsed.filePath.split(/[\\/]/).at(-1), source: "file" }
				: parsed.sourceKind === "stdin"
					? { source: "stdin" }
					: {}),
			...metadata,
		};
		const endpoint = new URL("/api/dump", baseUrl);
		const response = await fetchImpl(endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const result = (await response
			.json()
			.catch(() => null)) as DumpResponse | null;

		if (!response.ok) {
			throw new Error(result?.error ?? `Request failed (${response.status})`);
		}

		log(
			`Stored dump ${result?.dumpId ?? "successfully"} (${result?.chunksCreated ?? 0} chunks).`,
		);
		return 0;
	} catch (errorValue: unknown) {
		const message =
			errorValue instanceof Error ? errorValue.message : "Unknown error";
		error(`pdump: ${message}`);
		return 1;
	}
}

if (
	process.argv[1] &&
	pathToFileURL(process.argv[1]).href === import.meta.url
) {
	runCli(process.argv.slice(2)).then((exitCode) => {
		process.exitCode = exitCode;
	});
}
