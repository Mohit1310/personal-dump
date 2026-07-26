import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findUnique: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
}));

vi.mock("@/server/db", () => ({
	db: {
		dump: {
			findUnique: mocks.findUnique,
			update: mocks.update,
			delete: mocks.delete,
		},
	},
}));

import { DELETE, GET, PATCH } from "./route";

const validId = "00000000-0000-4000-8000-000000000001";
const request = new Request("http://localhost/api/dumps/example");
const mutationRequest = (method: "PATCH" | "DELETE", body?: unknown) =>
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
