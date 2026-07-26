import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	findMany: vi.fn(),
	count: vi.fn(),
	transaction: vi.fn(),
}));

vi.mock("@/server/db", () => ({
	db: {
		dump: { findMany: mocks.findMany, count: mocks.count },
		$transaction: mocks.transaction,
	},
}));

import { GET } from "./route";

const request = (query = "") =>
	new Request(`http://localhost/api/dumps${query ? `?${query}` : ""}`);

describe("GET /api/dumps", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.findMany.mockResolvedValue([]);
		mocks.count.mockResolvedValue(0);
		mocks.transaction.mockImplementation((operations: unknown[]) =>
			Promise.all(operations),
		);
	});

	it("returns an empty, bounded first page by default", async () => {
		const response = await GET(request());

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			dumps: [],
			pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
		});
		expect(mocks.findMany).toHaveBeenCalledWith({
			where: {},
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			skip: 0,
			take: 20,
			select: {
				id: true,
				title: true,
				type: true,
				tags: true,
				source: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	});

	it("combines text and metadata filters with deterministic pagination", async () => {
		mocks.findMany.mockResolvedValue([{ id: "dump-2" }]);
		mocks.count.mockResolvedValue(31);

		const response = await GET(
			request(
				"q=Prisma&type=solution&tag=database%20setup&source=Shell&page=2&pageSize=10",
			),
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			dumps: [{ id: "dump-2" }],
			pagination: { page: 2, pageSize: 10, total: 31, totalPages: 4 },
		});
		expect(mocks.count).toHaveBeenCalledWith({
			where: {
				OR: [
					{ content: { contains: "Prisma", mode: "insensitive" } },
					{ title: { contains: "Prisma", mode: "insensitive" } },
				],
				type: "solution",
				tags: { has: "database-setup" },
				source: { contains: "Shell", mode: "insensitive" },
			},
		});
		expect(mocks.findMany).toHaveBeenLastCalledWith(
			expect.objectContaining({ skip: 10, take: 10 }),
		);
	});

	it.each([
		"page=0",
		"page=1.5",
		"pageSize=101",
		"type=other",
		"tag=",
		"unknown=value",
		"page=1&page=2",
	])("rejects invalid query parameters: %s", async (query) => {
		expect((await GET(request(query))).status).toBe(400);
		expect(mocks.findMany).not.toHaveBeenCalled();
	});

	it("returns 500 when the database query fails", async () => {
		mocks.transaction.mockRejectedValueOnce(new Error("database down"));

		const response = await GET(request());

		expect(response.status).toBe(500);
		expect(await response.json()).toMatchObject({
			error: "Failed to retrieve dumps",
			message: "database down",
		});
	});
});
