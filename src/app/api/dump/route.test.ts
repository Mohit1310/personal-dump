import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	chunkText: vi.fn(),
	embedQuery: vi.fn(),
	dumpCreate: vi.fn(),
	chunkCreate: vi.fn(),
	executeRawUnsafe: vi.fn(),
}));

vi.mock("@/lib/processing/chunk-text", () => ({ chunkText: mocks.chunkText }));
vi.mock("@/lib/embeddings/embed-query", () => ({ embedQuery: mocks.embedQuery }));
vi.mock("@/server/db", () => ({
	db: { dump: { create: mocks.dumpCreate }, chunk: { create: mocks.chunkCreate }, $executeRawUnsafe: mocks.executeRawUnsafe },
}));

import { POST } from "./route";

const request = (body: unknown) => new Request("http://localhost/api/dump", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "content-type": "application/json" } });

describe("POST /api/dump", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.dumpCreate.mockResolvedValue({ id: "dump-1" });
		mocks.chunkCreate.mockImplementation(({ data }: { data: { order: number; content: string } }) => Promise.resolve({ id: `chunk-${data.order}`, ...data }));
		mocks.chunkText.mockReturnValue(["first", "second"]);
		mocks.embedQuery.mockImplementation((content: string) => Promise.resolve(content === "first" ? [1, 2] : [3, 4]));
		mocks.executeRawUnsafe.mockResolvedValue(1);
	});

	it.each([undefined, null, "", "   ", 42])("rejects invalid content %j", async (content) => {
		const response = await POST(request({ content }));
		expect(response.status).toBe(400);
		expect(mocks.dumpCreate).not.toHaveBeenCalled();
	});
	it("rejects invalid type and malformed JSON", async () => {
		expect((await POST(request({ content: "ok", type: "other" }))).status).toBe(400);
		expect((await POST(request("{"))).status).toBe(400);
	});
	it("ingests ordered chunks with one embedding and write per chunk", async () => {
		const response = await POST(request({ content: "original", type: "error" }));
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true, dumpId: "dump-1", chunksCreated: 2 });
		expect(mocks.chunkCreate.mock.calls.map(([arg]) => arg.data.order).sort()).toEqual([0, 1]);
		expect(mocks.chunkCreate.mock.calls.map(([arg]) => arg.data.content).sort()).toEqual(["first", "second"]);
		expect(mocks.embedQuery).toHaveBeenCalledTimes(2);
		expect(mocks.executeRawUnsafe).toHaveBeenCalledTimes(2);
	});
	it("returns 500 and characterizes partial writes when a dependency fails", async () => {
		mocks.embedQuery.mockRejectedValueOnce(new Error("provider down"));
		const response = await POST(request({ content: "original" }));
		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({ error: "Failed to store dump", message: "provider down" });
		expect(mocks.dumpCreate).toHaveBeenCalledTimes(1);
	});
});
