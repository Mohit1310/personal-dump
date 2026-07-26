import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	chunkText: vi.fn(),
	embedQuery: vi.fn(),
	findUnique: vi.fn(),
	update: vi.fn(),
	txUpdate: vi.fn(),
	delete: vi.fn(),
	deleteMany: vi.fn(),
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
		dump: {
			findUnique: mocks.findUnique,
			update: mocks.update,
			delete: mocks.delete,
		},
		$transaction: mocks.transaction,
	},
}));

import { DELETE, GET, PATCH, PUT } from "./route";

const validId = "00000000-0000-4000-8000-000000000001";
const request = new Request("http://localhost/api/dumps/example");
const mutationRequest = (method: "PATCH" | "PUT" | "DELETE", body?: unknown) =>
	new Request("http://localhost/api/dumps/example", {
		method,
		body: body === undefined ? undefined : JSON.stringify(body),
		headers: { "content-type": "application/json" },
	});
const context = (id: string) => ({ params: Promise.resolve({ id }) });

describe("GET /api/dumps/[id]", () => {
	beforeEach(() => vi.clearAllMocks());

	it("returns a detail record without chunks or embeddings", async () => {
		mocks.findUnique.mockResolvedValue({
			id: validId,
			content: "full content",
		});

		const response = await GET(request, context(validId));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			dump: { id: validId, content: "full content" },
		});
		expect(mocks.findUnique).toHaveBeenCalledWith({
			where: { id: validId },
			select: {
				id: true,
				content: true,
				title: true,
				type: true,
				tags: true,
				source: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	});

	it("returns 400 for an invalid id and 404 for a missing dump", async () => {
		expect((await GET(request, context("not-a-uuid"))).status).toBe(400);
		expect(mocks.findUnique).not.toHaveBeenCalled();
		mocks.findUnique.mockResolvedValue(null);
		expect((await GET(request, context(validId))).status).toBe(404);
	});

	it("returns 500 when the database lookup fails", async () => {
		mocks.findUnique.mockRejectedValueOnce(new Error("database down"));
		const response = await GET(request, context(validId));

		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to retrieve dump",
			message: "database down",
		});
	});
});

describe("PATCH /api/dumps/[id]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.update.mockResolvedValue({ id: validId, title: "Updated title" });
	});

	it("updates supplied normalized metadata without including content", async () => {
		const response = await PATCH(
			mutationRequest("PATCH", {
				title: "  Updated title  ",
				tags: [" TypeScript ", "database setup", "typescript"],
			}),
			context(validId),
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			dump: { id: validId, title: "Updated title" },
		});
		expect(mocks.update).toHaveBeenCalledWith({
			where: { id: validId },
			data: {
				title: "Updated title",
				tags: ["typescript", "database-setup"],
			},
			select: expect.objectContaining({
				id: true,
				content: true,
				updatedAt: true,
			}),
		});
	});

	it.each([
		["invalid id", "not-a-uuid", { title: "Updated" }],
		["empty object", validId, {}],
		["content edit", validId, { content: "new content" }],
		["invalid type", validId, { type: "other" }],
		[
			"too many tags",
			validId,
			{ tags: Array.from({ length: 21 }, (_, i) => `tag-${i}`) },
		],
	])("rejects %s without writing", async (_case, id, body) => {
		const response = await PATCH(mutationRequest("PATCH", body), context(id));

		expect(response.status).toBe(400);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("returns 404 for a missing dump and 500 for database failures", async () => {
		mocks.update.mockRejectedValueOnce(
			Object.assign(new Error("missing"), { code: "P2025" }),
		);
		expect(
			(
				await PATCH(
					mutationRequest("PATCH", { title: "Updated" }),
					context(validId),
				)
			).status,
		).toBe(404);

		mocks.update.mockRejectedValueOnce(new Error("database down"));
		const response = await PATCH(
			mutationRequest("PATCH", { title: "Updated" }),
			context(validId),
		);
		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to update dump",
			message: "database down",
		});
	});
});

describe("PUT /api/dumps/[id]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findUnique.mockResolvedValue({ id: validId });
		mocks.chunkText.mockReturnValue([
			"first replacement",
			"second replacement",
		]);
		mocks.embedQuery.mockImplementation((content: string) =>
			Promise.resolve(content === "first replacement" ? [1, 0] : [0, 1]),
		);
		mocks.txUpdate.mockResolvedValue({
			id: validId,
			content: "replacement content",
		});
		mocks.deleteMany.mockResolvedValue({ count: 2 });
		mocks.chunkCreate.mockImplementation(
			({ data }: { data: { order: number; content: string } }) =>
				Promise.resolve({ id: `new-chunk-${data.order}`, ...data }),
		);
		mocks.executeRaw.mockResolvedValue(1);
		mocks.transaction.mockImplementation((callback: (tx: object) => unknown) =>
			callback({
				dump: { update: mocks.txUpdate },
				chunk: {
					deleteMany: mocks.deleteMany,
					create: mocks.chunkCreate,
				},
				$executeRaw: mocks.executeRaw,
			}),
		);
	});

	it("replaces content and its ordered derived records", async () => {
		const response = await PUT(
			mutationRequest("PUT", { content: "replacement content" }),
			context(validId),
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			success: true,
			dump: { id: validId, content: "replacement content" },
			chunksCreated: 2,
		});
		expect(mocks.txUpdate).toHaveBeenCalledWith({
			where: { id: validId },
			data: { content: "replacement content" },
			select: expect.objectContaining({
				id: true,
				content: true,
				updatedAt: true,
			}),
		});
		expect(mocks.deleteMany).toHaveBeenCalledWith({
			where: { dumpId: validId },
		});
		expect(
			mocks.chunkCreate.mock.calls.map(([argument]) => ({
				content: argument.data.content,
				order: argument.data.order,
			})),
		).toEqual([
			{ content: "first replacement", order: 0 },
			{ content: "second replacement", order: 1 },
		]);
		expect(mocks.executeRaw).toHaveBeenCalledTimes(2);
	});

	it.each([
		["invalid id", "not-a-uuid", { content: "replacement" }],
		["missing content", validId, {}],
		["empty content", validId, { content: "" }],
		["blank content", validId, { content: "   " }],
		[
			"metadata in content operation",
			validId,
			{ content: "replacement", title: "not accepted" },
		],
	])("rejects %s before provider or database work", async (_case, id, body) => {
		const response = await PUT(mutationRequest("PUT", body), context(id));

		expect(response.status).toBe(400);
		expect(mocks.findUnique).not.toHaveBeenCalled();
		expect(mocks.embedQuery).not.toHaveBeenCalled();
		expect(mocks.transaction).not.toHaveBeenCalled();
	});

	it("returns 404 before generating embeddings when the dump is missing", async () => {
		mocks.findUnique.mockResolvedValueOnce(null);

		const response = await PUT(
			mutationRequest("PUT", { content: "replacement" }),
			context(validId),
		);

		expect(response.status).toBe(404);
		expect(mocks.embedQuery).not.toHaveBeenCalled();
		expect(mocks.transaction).not.toHaveBeenCalled();
	});

	it("generates every embedding before opening the transaction", async () => {
		await PUT(
			mutationRequest("PUT", { content: "replacement" }),
			context(validId),
		);

		expect(mocks.embedQuery).toHaveBeenCalledTimes(2);
		const lastEmbeddingCall = Math.max(
			...mocks.embedQuery.mock.invocationCallOrder,
		);
		expect(mocks.transaction.mock.invocationCallOrder[0]).toBeGreaterThan(
			lastEmbeddingCall,
		);
	});

	it("leaves persistence untouched when embedding generation fails", async () => {
		mocks.embedQuery.mockRejectedValueOnce(new Error("provider down"));

		const response = await PUT(
			mutationRequest("PUT", { content: "replacement" }),
			context(validId),
		);

		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to update dump content",
			message: "provider down",
		});
		expect(mocks.transaction).not.toHaveBeenCalled();
		expect(mocks.txUpdate).not.toHaveBeenCalled();
		expect(mocks.deleteMany).not.toHaveBeenCalled();
		expect(mocks.chunkCreate).not.toHaveBeenCalled();
		expect(mocks.executeRaw).not.toHaveBeenCalled();
	});

	it("reports a mid-persistence failure from the atomic replacement", async () => {
		mocks.executeRaw
			.mockResolvedValueOnce(1)
			.mockRejectedValueOnce(new Error("vector write failed"));

		const response = await PUT(
			mutationRequest("PUT", { content: "replacement" }),
			context(validId),
		);

		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to update dump content",
			message: "vector write failed",
		});
		expect(mocks.txUpdate).toHaveBeenCalledOnce();
		expect(mocks.deleteMany).toHaveBeenCalledOnce();
		expect(mocks.chunkCreate).toHaveBeenCalledTimes(2);
		expect(mocks.executeRaw).toHaveBeenCalledTimes(2);
	});
});

describe("DELETE /api/dumps/[id]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.delete.mockResolvedValue({ id: validId });
	});

	it("deletes by id", async () => {
		const response = await DELETE(mutationRequest("DELETE"), context(validId));

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ success: true });
		expect(mocks.delete).toHaveBeenCalledWith({ where: { id: validId } });
	});

	it("returns 400/404/500 without deleting invalid or missing records", async () => {
		expect(
			(await DELETE(mutationRequest("DELETE"), context("not-a-uuid"))).status,
		).toBe(400);
		expect(mocks.delete).not.toHaveBeenCalled();

		mocks.delete.mockRejectedValueOnce(
			Object.assign(new Error("missing"), { code: "P2025" }),
		);
		expect(
			(await DELETE(mutationRequest("DELETE"), context(validId))).status,
		).toBe(404);

		mocks.delete.mockRejectedValueOnce(new Error("database down"));
		const response = await DELETE(mutationRequest("DELETE"), context(validId));
		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to delete dump",
			message: "database down",
		});
	});
});
