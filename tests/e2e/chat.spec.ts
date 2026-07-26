import { expect, test } from "@playwright/test";

const models = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"] as const;

async function stubModels(page: import("@playwright/test").Page) {
	await page.route("**/api/models/groq", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ models }),
		});
	});
}

async function stubScope(
	page: import("@playwright/test").Page,
	dumps: Array<{ tags: string[]; source: string }> = [],
) {
	await page.route("**/api/dumps?pageSize=100", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				dumps,
				pagination: {
					page: 1,
					pageSize: 100,
					total: dumps.length,
					totalPages: dumps.length > 0 ? 1 : 0,
				},
			}),
		});
	});
}

async function stubChat(page: import("@playwright/test").Page, answer: string) {
	await page.route("**/api/chat", async (route) => {
		const body = await route.request().postDataJSON();
		await route.fulfill({
			status: 200,
			contentType: "text/event-stream",
			headers: { "x-vercel-ai-ui-message-stream": "v1" },
			body:
				[
					`data: ${JSON.stringify({ type: "text-start", id: "text-1" })}`,
					`data: ${JSON.stringify({ type: "text-delta", id: "text-1", delta: answer })}`,
					`data: ${JSON.stringify({ type: "text-end", id: "text-1" })}`,
					"data: [DONE]",
				].join("\n\n") + "\n\n",
		});
		void body;
	});
}

test.describe("chat", () => {
	test("shows a no-answer response from the intercepted chat stream", async ({
		page,
	}) => {
		await stubModels(page);
		await stubScope(page);
		await stubChat(page, "No relevant knowledge found in your dumps.");
		await page.goto("/chat");

		await page
			.getByPlaceholder("Enter command or query...")
			.pressSequentially("Something unknown");
		await page.getByRole("button", { name: "Submit" }).click();

		await expect(page.getByText("Something unknown")).toBeVisible();
		await expect(
			page.getByText("No relevant knowledge found in your dumps."),
		).toBeVisible();
	});

	test("sends the selected model and can clear the conversation", async ({
		page,
	}) => {
		await stubModels(page);
		await stubScope(page);
		let requestModel = "";
		await page.route("**/api/chat", async (route) => {
			requestModel = route.request().postDataJSON().model;
			await route.fulfill({
				status: 200,
				contentType: "text/event-stream",
				headers: { "x-vercel-ai-ui-message-stream": "v1" },
				body: `data: ${JSON.stringify({ type: "text-start", id: "text-1" })}\n\ndata: ${JSON.stringify({ type: "text-delta", id: "text-1", delta: "Stored answer" })}\n\ndata: ${JSON.stringify({ type: "text-end", id: "text-1" })}\n\ndata: [DONE]\n\n`,
			});
		});
		await page.goto("/chat");

		await page.getByRole("button", { name: models[0] }).click();
		const input = page.getByPlaceholder("Enter command or query...");
		await page.getByText(models[1], { exact: true }).last().click();
		await expect(page.getByRole("dialog")).toBeHidden();
		await input.click();
		await expect(input).toBeFocused();
		await input.pressSequentially("Recall this");
		await expect(input).toHaveValue("Recall this");
		await input.press("Enter");

		await expect(page.getByText("Stored answer")).toBeVisible();
		expect(requestModel).toBe(models[1]);
		await page.getByRole("button", { name: "Clear conversation" }).click();
		await expect(page.getByText("Recall this")).toBeHidden();
		await expect(page.getByText("AWAITING INPUT")).toBeVisible();
	});

	test("selects scope by keyboard, submits it once, clears it, and fits at 390px", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await stubModels(page);
		await stubScope(page, [
			{ tags: ["database-setup"], source: "Shell history" },
		]);
		let chatRequests = 0;
		let requestBody: Record<string, unknown> = {};
		await page.route("**/api/chat", async (route) => {
			chatRequests += 1;
			requestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: "text/event-stream",
				headers: { "x-vercel-ai-ui-message-stream": "v1" },
				body: `data: ${JSON.stringify({ type: "text-start", id: "text-1" })}\n\ndata: ${JSON.stringify({ type: "text-delta", id: "text-1", delta: "Scoped answer" })}\n\ndata: ${JSON.stringify({ type: "text-end", id: "text-1" })}\n\ndata: [DONE]\n\n`,
			});
		});
		await page.goto("/chat");

		const typeScope = page.getByRole("combobox", {
			name: "Knowledge type scope",
		});
		await typeScope.focus();
		await typeScope.press("End");
		const tagScope = page.getByRole("combobox", {
			name: "Knowledge tag scope",
		});
		await tagScope.focus();
		await tagScope.press("ArrowDown");
		const sourceScope = page.getByRole("combobox", {
			name: "Knowledge source scope",
		});
		await sourceScope.focus();
		await sourceScope.press("ArrowDown");

		await expect(page.getByText("3 active")).toBeVisible();
		const input = page.getByPlaceholder("Enter command or query...");
		await input.fill("Use my scoped knowledge");
		await input.press("Enter");
		await expect(page.getByText("Scoped answer")).toBeVisible();

		expect(chatRequests).toBe(1);
		expect(requestBody.filters).toEqual({
			type: "solution",
			tag: "database-setup",
			source: "Shell history",
		});
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth,
			),
		).toBe(true);

		await page.getByRole("button", { name: "Clear scope" }).click();
		await expect(page.getByText("All knowledge")).toBeVisible();
		await expect(typeScope).toHaveValue("");
		await expect(tagScope).toHaveValue("");
		await expect(sourceScope).toHaveValue("");
	});

	test("empty scope options preserve all-knowledge submission", async ({
		page,
	}) => {
		await stubModels(page);
		await stubScope(page);
		let requestBody: Record<string, unknown> = {};
		await page.route("**/api/chat", async (route) => {
			requestBody = route.request().postDataJSON();
			await route.fulfill({
				status: 200,
				contentType: "text/event-stream",
				headers: { "x-vercel-ai-ui-message-stream": "v1" },
				body: `data: ${JSON.stringify({ type: "text-start", id: "text-1" })}\n\ndata: ${JSON.stringify({ type: "text-delta", id: "text-1", delta: "All knowledge answer" })}\n\ndata: ${JSON.stringify({ type: "text-end", id: "text-1" })}\n\ndata: [DONE]\n\n`,
			});
		});
		await page.goto("/chat");

		await expect(
			page.getByRole("combobox", { name: "Knowledge tag scope" }),
		).toBeDisabled();
		await expect(
			page.getByRole("combobox", { name: "Knowledge source scope" }),
		).toBeDisabled();
		await page
			.getByPlaceholder("Enter command or query...")
			.fill("Search everything");
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByText("All knowledge answer")).toBeVisible();
		expect(requestBody).not.toHaveProperty("filters");
	});
});
