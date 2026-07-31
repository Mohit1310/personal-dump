import { open, stat } from "node:fs/promises";

export const MAX_INPUT_BYTES = 1_048_576;

export class InputError extends Error {}

function validateContent(content: string, source: "File" | "Standard input") {
	if (!content.trim())
		throw new InputError(`${source} content cannot be empty.`);
	return content;
}

function decodeContent(buffer: Buffer, source: "File" | "Standard input") {
	if (buffer.includes(0))
		throw new InputError(`${source} contains binary data.`);

	try {
		return validateContent(
			new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(buffer),
			source,
		);
	} catch (error) {
		if (error instanceof InputError) throw error;
		throw new InputError(`${source} is not valid UTF-8 text.`);
	}
}

async function readBounded(
	read: (buffer: Buffer) => Promise<number>,
	source: "File" | "Standard input",
) {
	const chunks: Buffer[] = [];
	let total = 0;

	while (true) {
		const buffer = Buffer.allocUnsafe(
			Math.min(64 * 1024, MAX_INPUT_BYTES + 1 - total),
		);
		const bytesRead = await read(buffer);
		if (bytesRead === 0) break;

		total += bytesRead;
		if (total > MAX_INPUT_BYTES)
			throw new InputError(`${source} is too large.`);
		chunks.push(buffer.subarray(0, bytesRead));
	}

	return decodeContent(Buffer.concat(chunks, total), source);
}

export async function readFileInput(
	filePath: string,
	{ openFile = open }: { openFile?: typeof open } = {},
) {
	let handle: Awaited<ReturnType<typeof open>> | undefined;

	try {
		if (!(await stat(filePath)).isFile()) {
			throw new InputError("File is not a regular file.");
		}
		handle = await openFile(filePath, "r");
		if (!(await handle.stat()).isFile()) {
			throw new InputError("File is not a regular file.");
		}
		const fileHandle = handle;

		return await readBounded(async (buffer) => {
			const { bytesRead } = await fileHandle.read(
				buffer,
				0,
				buffer.length,
				null,
			);
			return bytesRead;
		}, "File");
	} catch (error) {
		if (error instanceof InputError) throw error;
		throw new InputError("File cannot be read.");
	} finally {
		await handle?.close().catch(() => undefined);
	}
}

export async function readStdinInput(
	input: AsyncIterable<Uint8Array | string> = process.stdin,
) {
	const chunks: Buffer[] = [];
	let total = 0;

	for await (const chunk of input) {
		const length =
			typeof chunk === "string" ? Buffer.byteLength(chunk) : chunk.byteLength;
		if (total + length > MAX_INPUT_BYTES) {
			throw new InputError("Standard input is too large.");
		}
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		total += length;
		chunks.push(buffer);
	}

	return decodeContent(Buffer.concat(chunks, total), "Standard input");
}
