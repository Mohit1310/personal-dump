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
		run: (args: string[]) =>
			runCli(args, { fetch: fetchImpl, baseUrl, log, error }),
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

	it("rejects invalid arguments with usage", async () => {
		const c = cli();
		expect(await c.run(["add"])).toBe(1);
		expect(c.error).toHaveBeenCalledWith(`pdump: ${usage}`);
	});

	it("parses valid input", () =>
		expect(parseArgs(["add", "--text", "hello"])).toEqual({
			content: "hello",
		}));

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

	it.each([
		[response({ message: "bad input" }, 400), "bad input"],
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
