import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	chunkText: vi.fn(),
	embedQuery: vi.fn(),
	dumpCreate: vi.fn(),
	chunkCreate: vi.fn(),
	executeRaw: vi.fn(),
	transaction: vi.fn(),
}));

vi.mock("@/lib/processing/chunk-text", () => ({ chunkText: mocks.chunkText }));
vi.mock("@/lib/embeddings/embed-query", () => ({
	embedQuery: mocks.embedQuery,
}));
vi.mock("@/server/db", () => ({
	db: {
		dump: { create: mocks.dumpCreate },
		chunk: { create: mocks.chunkCreate },
		$executeRaw: mocks.executeRaw,
		$transaction: mocks.transaction,
	},
}));

import { POST } from "./route";

const request = (body: unknown) =>
	new Request("http://localhost/api/dump", {
		method: "POST",
		body: typeof body === "string" ? body : JSON.stringify(body),
		headers: { "content-type": "application/json" },
	});

describe("POST /api/dump", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.dumpCreate.mockResolvedValue({ id: "dump-1" });
		mocks.chunkCreate.mockImplementation(
			({ data }: { data: { order: number; content: string } }) =>
				Promise.resolve({ id: `chunk-${data.order}`, ...data }),
		);
		mocks.chunkText.mockReturnValue(["first", "second"]);
		mocks.embedQuery.mockImplementation((content: string) =>
			Promise.resolve(content === "first" ? [1, 2] : [3, 4]),
		);
		mocks.executeRaw.mockResolvedValue(1);
		mocks.transaction.mockImplementation((callback: (tx: object) => unknown) =>
			callback({
				dump: { create: mocks.dumpCreate },
				chunk: { create: mocks.chunkCreate },
				$executeRaw: mocks.executeRaw,
			}),
		);
	});

	it.each([undefined, null, "", "   ", 42])(
		"rejects invalid content %j",
		async (content) => {
			const response = await POST(request({ content }));
			expect(response.status).toBe(400);
			expect(mocks.dumpCreate).not.toHaveBeenCalled();
		},
	);
	it("rejects invalid type and malformed JSON", async () => {
		expect((await POST(request({ content: "ok", type: "other" }))).status).toBe(
			400,
		);
		expect((await POST(request("{"))).status).toBe(400);
	});
	it("preserves original content formatting", async () => {
		const content = "  code snippet\n  ";
		const response = await POST(request({ content }));

		expect(response.status).toBe(200);
		expect(mocks.dumpCreate).toHaveBeenCalledWith({ data: { content } });
		expect(mocks.chunkText).toHaveBeenCalledWith(content);
	});
	it("ingests ordered chunks with one embedding and write per chunk", async () => {
		const response = await POST(
			request({ content: "original", type: "error" }),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			success: true,
			dumpId: "dump-1",
			chunksCreated: 2,
		});
		expect(
			mocks.chunkCreate.mock.calls.map(([arg]) => arg.data.order).sort(),
		).toEqual([0, 1]);
		expect(
			mocks.chunkCreate.mock.calls.map(([arg]) => arg.data.content).sort(),
		).toEqual(["first", "second"]);
		expect(mocks.embedQuery).toHaveBeenCalledTimes(2);
		expect(mocks.executeRaw).toHaveBeenCalledTimes(2);
	});
	it("returns 500 without database writes when embedding generation fails", async () => {
		mocks.embedQuery.mockRejectedValueOnce(new Error("provider down"));
		const response = await POST(request({ content: "original" }));
		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to store dump",
			message: "provider down",
		});
		expect(mocks.transaction).not.toHaveBeenCalled();
		expect(mocks.dumpCreate).not.toHaveBeenCalled();
		expect(mocks.chunkCreate).not.toHaveBeenCalled();
		expect(mocks.executeRaw).not.toHaveBeenCalled();
	});
});
