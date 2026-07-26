import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ findUnique: vi.fn() }));

vi.mock("@/server/db", () => ({
	db: { dump: { findUnique: mocks.findUnique } },
}));

import { GET } from "./route";

const validId = "00000000-0000-4000-8000-000000000001";
const request = new Request("http://localhost/api/dumps/example");
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
