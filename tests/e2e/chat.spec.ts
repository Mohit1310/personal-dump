import { expect, test } from "@playwright/test";

const models = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"];

async function stubModels(page: import("@playwright/test").Page) {
	await page.route("**/api/models/groq", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ models }),
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
		await page.getByRole("button", { name: "Clear" }).click();
		await expect(page.getByText("Recall this")).toBeHidden();
		await expect(page.getByText("AWAITING INPUT")).toBeVisible();
	});
});
