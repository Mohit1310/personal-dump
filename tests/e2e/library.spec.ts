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
		await page.route(/\/api\/dumps(?:\/[^?]+)?(?:\?.*)?$/, async (route) => {
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

test.describe("library detail", () => {
	test("creates, browses, edits, re-indexes, and deliberately deletes a dump", async ({
		page,
	}) => {
		const detail = {
			...dump(
				"a4e96812-a162-42c8-abcc-a3c24688d20f",
				"Browser journey",
				"note",
			),
			content: "Original browser content",
		};
		let exists = false;
		await page.addInitScript((initialDetail) => {
			let current = initialDetail;
			const originalFetch = window.fetch.bind(window);
			window.fetch = async (input, init) => {
				const url =
					typeof input === "string"
						? input
						: input instanceof URL
							? input.href
							: input.url;
				if (!url.includes(`/api/dumps/${current.id}`)) {
					return originalFetch(input, init);
				}
				const method = init?.method ?? "GET";
				if (method === "PATCH" || method === "PUT") {
					const body = JSON.parse(String(init?.body));
					current = { ...current, ...body };
				}
				return new Response(
					JSON.stringify(
						method === "DELETE" ? { success: true } : { dump: current },
					),
					{ headers: { "Content-Type": "application/json" } },
				);
			};
		}, detail);

		await page.route("**/api/dump", async (route) => {
			exists = true;
			await route.fulfill({ status: 201, body: JSON.stringify({}) });
		});
		await page.route("**/api/dumps*", async (route) => {
			const request = route.request();
			const url = new URL(request.url());
			if (url.pathname === "/api/dumps") {
				await route.fulfill({
					contentType: "application/json",
					body: JSON.stringify(
						response(exists ? [detail] : [], {
							page: 1,
							total: exists ? 1 : 0,
							totalPages: exists ? 1 : 0,
						}),
					),
				});
				return;
			}

			if (request.method() === "PATCH") {
				const body = request.postDataJSON() as {
					title: string;
					tags: string[];
				};
				detail.title = body.title;
				detail.tags = body.tags;
			}
			if (request.method() === "PUT") {
				detail.content = (
					request.postDataJSON() as { content: string }
				).content;
			}
			if (request.method() === "DELETE") {
				exists = false;
				await route.fulfill({
					status: 200,
					body: JSON.stringify({ success: true }),
				});
				return;
			}
			await route.fulfill({
				contentType: "application/json",
				body: JSON.stringify({ dump: detail }),
			});
		});

		await page.goto("/dump");
		await page
			.getByPlaceholder(/input stream ready/i)
			.fill("Original browser content");
		await page.getByRole("button", { name: /dump data/i }).click();
		await expect(
			page.getByText("Knowledge stored successfully!"),
		).toBeVisible();

		await page.goto("/library");
		await page.getByRole("link", { name: "Browser journey" }).click();
		await expect(
			page.getByRole("heading", { name: "Browser journey" }),
		).toBeVisible();

		await page.getByLabel("Title").fill("Updated browser journey");
		await page.getByLabel("Tags").fill("browser, journey");
		await expect(page.getByText("Unsaved changes")).toBeVisible();
		await page.getByRole("button", { name: "Save metadata" }).click();
		await expect(page.getByText("Unsaved changes")).not.toBeVisible();

		await page.getByLabel("Dump content").fill("Replacement browser content");
		await page.getByRole("button", { name: "Re-index content" }).click();
		await expect(page.getByText("Not indexed")).not.toBeVisible();

		await page.getByRole("button", { name: "Delete dump" }).click();
		const confirmation = page.getByLabel("Confirmation");
		await expect(confirmation).toBeFocused();
		await expect(
			page.getByRole("button", { name: "Delete permanently" }),
		).toBeDisabled();
		await confirmation.fill("DELETE");
		await page.getByRole("button", { name: "Delete permanently" }).click();
		await expect(page).toHaveURL(/\/library$/);
	});

	test("retains unsaved content and the delete confirmation on failed requests", async ({
		page,
	}) => {
		const detail = {
			...dump(
				"d755d11a-20ef-417f-ae2c-dc829f06ba5d",
				"Failure states",
				"error",
			),
			content: "Initial content",
		};
		await page.addInitScript((current) => {
			const originalFetch = window.fetch.bind(window);
			window.fetch = async (input, init) => {
				const url =
					typeof input === "string"
						? input
						: input instanceof URL
							? input.href
							: input.url;
				if (!url.includes(`/api/dumps/${current.id}`)) {
					return originalFetch(input, init);
				}
				if (init?.method === "PUT") {
					return new Response(
						JSON.stringify({ error: "Failed to update dump content" }),
						{ status: 500 },
					);
				}
				if (init?.method === "DELETE") {
					return new Response(
						JSON.stringify({ error: "Failed to delete dump" }),
						{
							status: 500,
						},
					);
				}
				return new Response(JSON.stringify({ dump: current }));
			};
		}, detail);

		await page.goto(`/library/${detail.id}`);
		await page.getByLabel("Dump content").fill("Keep this content");
		await page.getByRole("button", { name: "Re-index content" }).click();
		await expect(
			page.getByText("Failed to update dump content", { exact: true }),
		).toBeVisible();
		await expect(page.getByLabel("Dump content")).toHaveValue(
			"Keep this content",
		);

		await page.getByRole("button", { name: "Delete dump" }).click();
		await page.getByLabel("Confirmation").fill("DELETE");
		await page.getByRole("button", { name: "Delete permanently" }).click();
		await expect(page.getByRole("dialog")).toBeVisible();
		await expect(page.getByLabel("Confirmation")).toHaveValue("DELETE");
		await expect(
			page.getByText("Failed to delete dump", { exact: true }),
		).toBeVisible();
	});
});
