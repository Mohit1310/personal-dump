#!/usr/bin/env node

const usage = 'Usage: pnpm pdump add --text "text to store"';

type DumpResponse = {
	chunksCreated?: number;
	dumpId?: string;
	error?: string;
	message?: string;
	success?: boolean;
};

async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		console.log(usage);
		return;
	}

	if (args.length !== 3 || args[0] !== "add" || args[1] !== "--text") {
		throw new Error(usage);
	}

	const content = args[2];

	if (!content?.trim()) {
		throw new Error("Text cannot be empty.");
	}

	const baseUrl = process.env.PERSONAL_DUMP_URL ?? "http://localhost:3000";
	const endpoint = new URL("/api/dump", baseUrl);
	const response = await fetch(endpoint, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ content }),
	});
	const result = (await response
		.json()
		.catch(() => null)) as DumpResponse | null;

	if (!response.ok) {
		throw new Error(
			result?.message ?? result?.error ?? `Request failed (${response.status})`,
		);
	}

	console.log(
		`Stored dump ${result?.dumpId ?? "successfully"} (${result?.chunksCreated ?? 0} chunks).`,
	);
}

main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : "Unknown error";
	console.error(`pdump: ${message}`);
	process.exitCode = 1;
});
