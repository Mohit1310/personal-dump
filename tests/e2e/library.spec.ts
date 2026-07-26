import { expect, test } from "@playwright/test";

const dump = (
	id: string,
	title: string,
	type: "note" | "error" | "solution",
) => ({
	id,
	title,
	type,
	tags: ["database-setup"],
	source: "Shell history",
	createdAt: "2026-07-26T12:00:00.000Z",
	updatedAt: "2026-07-26T13:00:00.000Z",
});

const response = (
	dumps: ReturnType<typeof dump>[],
	pagination: { page: number; total: number; totalPages: number },
) => ({
	dumps,
	pagination: { ...pagination, pageSize: 20 },
});

test.describe("knowledge library", () => {
	test("browses stored summaries and updates shareable search and type filters", async ({
		page,
	}) => {
		await page.route("**/api/dumps*", async (route) => {
			const url = new URL(route.request().url());
			const isFiltered =
				url.searchParams.has("q") || url.searchParams.has("type");
			await route.fulfill({
				contentType: "application/json",
				body: JSON.stringify(
					response(
						isFiltered
							? [dump("dump-2", "Prisma pagination", "solution")]
							: [dump("dump-1", "Stored shell command", "note")],
						{ page: 1, total: 1, totalPages: 1 },
					),
				),
			});
		});

		await page.goto("/library");
		await expect(page.getByRole("heading", { name: "LIBRARY" })).toBeVisible();
		await expect(page.getByText("Stored shell command")).toBeVisible();
		await expect(page.getByText(/source: shell history/i)).toBeVisible();

		await page
			.getByRole("textbox", { name: "Search library" })
			.pressSequentially("prisma");
		await expect(page).toHaveURL(/\/library\?q=prisma&page=1/);
		await expect(page.getByText("Prisma pagination")).toBeVisible();

		await page.getByRole("combobox", { name: "Filter by type" }).click();
		await page.getByRole("option", { name: "Solution" }).click();
		await expect(page).toHaveURL(/type=solution/);
	});

	test("paginates library results without losing the active query", async ({
		page,
	}) => {
		await page.route("**/api/dumps*", async (route) => {
			const url = new URL(route.request().url());
			const isSecondPage = url.searchParams.get("page") === "2";
			await route.fulfill({
				contentType: "application/json",
				body: JSON.stringify(
					response(
						[
							isSecondPage
								? dump("dump-2", "Second result", "error")
								: dump("dump-1", "First result", "note"),
						],
						{ page: isSecondPage ? 2 : 1, total: 21, totalPages: 2 },
					),
				),
			});
		});

		await page.goto("/library?q=prisma");
		await expect(page.getByText("First result")).toBeVisible();
		await page.getByRole("button", { name: "Next", exact: true }).click();
		await expect(page).toHaveURL(/q=prisma&page=2/);
		await expect(page.getByText("Second result")).toBeVisible();
		await expect(page.getByRole("button", { name: /previous/i })).toBeEnabled();
	});

	test("distinguishes an unavailable library and retries successfully", async ({
		page,
	}) => {
		let shouldFail = true;
		await page.route("**/api/dumps*", async (route) => {
			if (shouldFail) {
				await route.fulfill({
					status: 500,
					body: JSON.stringify({ error: "offline" }),
				});
				return;
			}
			await route.fulfill({
				contentType: "application/json",
				body: JSON.stringify(
					response([dump("dump-1", "Recovered result", "note")], {
						page: 1,
						total: 1,
						totalPages: 1,
					}),
				),
			});
		});

		await page.goto("/library");
		await expect(
			page.getByRole("alert", { name: "Could not load the library" }),
		).toContainText("Could not load the library");
		shouldFail = false;
		await page.getByRole("button", { name: /retry/i }).click();
		await expect(page.getByText("Recovered result")).toBeVisible();
	});
});
