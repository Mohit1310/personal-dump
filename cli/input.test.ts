import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_INPUT_BYTES, readFileInput, readStdinInput } from "./input.js";

async function tempPath(name: string) {
	return join(await mkdtemp(join(tmpdir(), "pdump-input-")), name);
}

async function* stdin(...chunks: Array<Uint8Array | string>) {
	yield* chunks;
}

describe("CLI input", () => {
	it("reads valid UTF-8 files without changing BOM, Unicode, or line endings", async () => {
		const filePath = await tempPath("note.txt");
		const content = "\uFEFFhello\r\n世界\n";
		await writeFile(filePath, content, "utf8");
		expect(await readFileInput(filePath)).toBe(content);
	});

	it("reads a symlink whose target is a regular file", async () => {
		const target = await tempPath("target.txt");
		const link = join(tmpdir(), `pdump-link-${crypto.randomUUID()}.txt`);
		await writeFile(target, "linked", "utf8");
		try {
			await symlink(target, link);
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "EPERM") return;
			throw error;
		}
		expect(await readFileInput(link)).toBe("linked");
	});

	it.each([
		[Buffer.from([0xc3, 0x28]), "File is not valid UTF-8 text."],
		[Buffer.from("hello\0world"), "File contains binary data."],
		[Buffer.alloc(0), "File content cannot be empty."],
		[Buffer.from(" \r\n\t"), "File content cannot be empty."],
	])("rejects invalid file input", async (contents, message) => {
		const filePath = await tempPath("invalid.txt");
		await writeFile(filePath, contents);
		await expect(readFileInput(filePath)).rejects.toMatchObject({ message });
	});

	it("rejects directories and missing files without leaking their paths", async () => {
		const directory = await tempPath("directory");
		await mkdir(directory);
		await expect(readFileInput(directory)).rejects.toMatchObject({
			message: "File is not a regular file.",
		});
		await expect(readFileInput(`${directory}-missing`)).rejects.toMatchObject({
			message: "File cannot be read.",
		});
	});

	it("reports a mocked permission failure without exposing OS details", async () => {
		const filePath = await tempPath("private.txt");
		await writeFile(filePath, "private", "utf8");
		await expect(
			readFileInput(filePath, {
				openFile: async () => {
					throw new Error("EACCES: private path details");
				},
			}),
		).rejects.toMatchObject({ message: "File cannot be read." });
	});

	it("rejects files over the byte limit", async () => {
		const filePath = await tempPath("large.txt");
		await writeFile(filePath, "a".repeat(MAX_INPUT_BYTES + 1), "utf8");
		await expect(readFileInput(filePath)).rejects.toMatchObject({
			message: "File is too large.",
		});
	});

	it("reads stdin incrementally and preserves its bytes", async () => {
		expect(await readStdinInput(stdin("\uFEFFfirst\r\n", "第二行\n"))).toBe(
			"\uFEFFfirst\r\n第二行\n",
		);
	});

	it("stops stdin at the size limit without retaining additional chunks", async () => {
		await expect(
			readStdinInput(stdin("a".repeat(MAX_INPUT_BYTES), "b")),
		).rejects.toMatchObject({ message: "Standard input is too large." });
	});

	it.each([
		[stdin(Buffer.from([0xff])), "Standard input is not valid UTF-8 text."],
		[stdin("\0"), "Standard input contains binary data."],
		[stdin(" \n"), "Standard input content cannot be empty."],
	])("rejects invalid stdin", async (input, message) => {
		await expect(readStdinInput(input)).rejects.toMatchObject({ message });
	});
});
