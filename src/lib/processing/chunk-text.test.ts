import { describe, expect, it } from "vitest";
import { chunkText } from "./chunk-text";

describe("chunkText", () => {
	it("leaves short input unchanged", () => {
		const input = "short\ntext";
		expect(chunkText(input, 100, 0)).toEqual([input]);
	});

	it("prefers paragraph, newline, and fallback boundaries", () => {
		expect(chunkText("aaaa\n\nbbbb\n\ncccc", 6, 0)).toEqual([
			"aaaa\n\n",
			"bbbb\n\n",
			"cccc",
		]);
		expect(chunkText("aaaaaa\nbbbb\ncccc", 8, 0)[0]).toBe("aaaaaa\n");
		expect(chunkText("abcdefghij", 4, 0)).toEqual(["abcd", "efgh", "ij"]);
	});

	it("keeps chunks ordered and overlapping", () => {
		const chunks = chunkText("abcdefghij", 5, 2);
		expect(chunks).toEqual(["abcde", "defgh", "ghij"]);
	});

	it("covers all input content", () => {
		const input = "one two three four five six seven";
		const chunks = chunkText(input, 10, 3);
		for (const character of new Set(input)) {
			expect(chunks.join("")).toContain(character);
		}
	});

	it("handles empty, whitespace, and Unicode input", () => {
		expect(chunkText("")).toEqual([""]);
		expect(chunkText("   ")).toEqual(["   "]);
		expect(chunkText("😀漢字", 2, 0).join("")).toContain("😀");
	});

	it("rejects unsafe parameters", () => {
		for (const value of [0, -1, NaN, Infinity, 1.5]) {
			expect(() => chunkText("abc", value)).toThrow(RangeError);
		}
		expect(() => chunkText("abc", 2, -1)).toThrow(RangeError);
		expect(() => chunkText("abc", 2, 2)).toThrow(RangeError);
	});

	it("does not split fenced code blocks", () => {
		const input =
			"before\n\n```ts\nconst answer = 42;\nconsole.log(answer);\n```\n\nafter";
		const chunks = chunkText(input, 18, 3);
		expect(
			chunks.some((chunk) => chunk.includes("```ts") && chunk.includes("```")),
		).toBe(true);
		expect(chunks.join("")).toContain("const answer = 42;");
	});
});
