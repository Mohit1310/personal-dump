import { describe, expect, it, vi } from "vitest";
import { parseArgs, runCli, usage } from "./pdump.js";

const response = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

function cli(
	fetchImpl = vi.fn<typeof fetch>(),
	baseUrl = "http://localhost:3000",
) {
	const log = vi.fn();
	const error = vi.fn();
	return {
		fetchImpl,
		log,
		error,
		run: (args: string[], input = {}) =>
			runCli(args, { fetch: fetchImpl, baseUrl, log, error, ...input }),
	};
}

describe("pdump CLI", () => {
	it("prints help successfully", async () => {
		const c = cli();
		expect(await c.run(["--help"])).toBe(0);
		expect(c.log).toHaveBeenCalledWith(usage);
		expect(c.fetchImpl).not.toHaveBeenCalled();
	});

	it.each([[""], ["   "], ["\t\n"]])("rejects empty text %j", async (text) => {
		const c = cli();
		expect(await c.run(["add", "--text", text])).toBe(1);
		expect(c.error).toHaveBeenCalledWith("pdump: Text cannot be empty.");
	});

	it("rejects a missing source", async () => {
		const c = cli();
		expect(await c.run(["add"])).toBe(1);
		expect(c.error).toHaveBeenCalledWith(
			"pdump: Exactly one input source is required.",
		);
	});

	it("parses valid input", () =>
		expect(parseArgs(["add", "--text", "hello"])).toEqual({
			sourceKind: "text",
			content: "hello",
		}));

	it("parses metadata in any order and keeps repeated tags", () => {
		expect(
			parseArgs([
				"add",
				"--tag",
				"first",
				"--file",
				"notes/example.md",
				"--type",
				"solution",
				"--tag",
				"second",
				"--title",
				"Example",
				"--source",
				"terminal",
			]),
		).toEqual({
			sourceKind: "file",
			filePath: "notes/example.md",
			tags: ["first", "second"],
			type: "solution",
			title: "Example",
			source: "terminal",
		});
	});

	it.each([
		["add", "--text", "one", "--file", "two"],
		["add", "--stdin", "--stdin"],
		["add", "--text", "one", "--title", "a", "--title", "b"],
		["add", "--text", "one", "--unknown"],
		["add", "--text"],
		["add", "--text", "one", "unexpected"],
	])("rejects invalid command arguments %j", async (...args) => {
		const c = cli();
		expect(await c.run(args)).toBe(1);
		expect(c.error).toHaveBeenCalledTimes(1);
		expect(c.fetchImpl).not.toHaveBeenCalled();
	});

	it.each(["/tmp/input", "C:\\temp\\input", "\\\\server\\share\\input"])(
		"rejects absolute metadata sources",
		async (source) => {
			const c = cli();
			expect(await c.run(["add", "--text", "hello", "--source", source])).toBe(
				1,
			);
			expect(c.fetchImpl).not.toHaveBeenCalled();
		},
	);

	it("posts to the default endpoint with expected request", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockResolvedValue(response({ dumpId: "d1", chunksCreated: 2 }));
		const c = cli(fetchImpl);
		expect(await c.run(["add", "--text", "hello"])).toBe(0);
		expect(fetchImpl).toHaveBeenCalledWith(
			new URL("/api/dump", "http://localhost:3000"),
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: "hello" }),
			},
		);
		expect(c.log).toHaveBeenCalledWith("Stored dump d1 (2 chunks).");
	});

	it("uses PERSONAL_DUMP_URL when supplied", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockResolvedValue(response({ dumpId: "d2", chunksCreated: 1 }));
		const c = cli(fetchImpl, "https://example.test/base");
		expect(await c.run(["add", "--text", "hello"])).toBe(0);
		expect(fetchImpl.mock.calls[0]?.[0]).toEqual(
			new URL("/api/dump", "https://example.test/base"),
		);
	});

	it("posts file content with private defaults and no path", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockResolvedValue(response({ dumpId: "d3", chunksCreated: 1 }));
		const c = cli(fetchImpl);
		const filePath = "C:\\private\\notes\\deploy.md";
		expect(
			await c.run(["add", "--file", filePath], {
				readFile: vi.fn().mockResolvedValue("line one\r\nline two"),
			}),
		).toBe(0);
		expect(fetchImpl.mock.calls[0]?.[1]?.body).toBe(
			JSON.stringify({
				content: "line one\r\nline two",
				title: "deploy.md",
				source: "file",
			}),
		);
	});

	it("lets explicit metadata override file defaults", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockResolvedValue(response({ dumpId: "d4", chunksCreated: 1 }));
		const c = cli(fetchImpl);
		expect(
			await c.run(
				[
					"add",
					"--file",
					"note.md",
					"--title",
					"Custom",
					"--type",
					"error",
					"--tag",
					"one",
					"--tag",
					"one",
					"--source",
					"terminal",
				],
				{ readFile: vi.fn().mockResolvedValue("content") },
			),
		).toBe(0);
		expect(fetchImpl.mock.calls[0]?.[1]?.body).toBe(
			JSON.stringify({
				content: "content",
				title: "Custom",
				source: "terminal",
				type: "error",
				tags: ["one", "one"],
			}),
		);
	});

	it("posts stdin content with its default source", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockResolvedValue(response({ dumpId: "d5", chunksCreated: 1 }));
		const c = cli(fetchImpl);
		expect(
			await c.run(["add", "--stdin"], {
				readStdin: vi.fn().mockResolvedValue("piped content"),
			}),
		).toBe(0);
		expect(fetchImpl.mock.calls[0]?.[1]?.body).toBe(
			JSON.stringify({ content: "piped content", source: "stdin" }),
		);
	});

	it("does not fetch when an input reader rejects", async () => {
		const c = cli();
		expect(
			await c.run(["add", "--file", "missing.txt"], {
				readFile: vi.fn().mockRejectedValue(new Error("File cannot be read.")),
			}),
		).toBe(1);
		expect(c.fetchImpl).not.toHaveBeenCalled();
	});

	it.each([
		[response({ message: "bad input" }, 400), "Request failed (400)"],
		[response({ error: "broken" }, 500), "broken"],
		[new Response("not json", { status: 502 }), "Request failed (502)"],
	])("reports HTTP/API errors", async (result, message) => {
		const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(result);
		const c = cli(fetchImpl);
		expect(await c.run(["add", "--text", "hello"])).toBe(1);
		expect(c.error).toHaveBeenCalledWith(`pdump: ${message}`);
	});

	it("reports network errors and returns non-zero", async () => {
		const fetchImpl = vi
			.fn<typeof fetch>()
			.mockRejectedValue(new Error("offline"));
		const c = cli(fetchImpl);
		expect(await c.run(["add", "--text", "hello"])).toBe(1);
		expect(c.error).toHaveBeenCalledWith("pdump: offline");
	});
});
