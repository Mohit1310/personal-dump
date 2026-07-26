import { expect, test } from "@playwright/test";

test.describe("dump submission", () => {
	test("submits a dump successfully and clears the editor", async ({ page }) => {
		await page.route("**/api/dump", async (route) => {
			await route.fulfill({ status: 201, contentType: "application/json", body: "{}" });
		});

		await page.goto("/dump");
		const editor = page.getByPlaceholder(/input stream ready/i);
		const submit = page.getByRole("button", { name: /dump data/i });
		await expect(submit).toBeDisabled();

		await editor.pressSequentially("A useful note from the browser test.");
		await expect(submit).toBeEnabled();
		await submit.click();

		await expect(page.getByText("Knowledge stored successfully!"))
			.toBeVisible();
		await expect(editor).toHaveValue("");
	});

	test("preserves text and shows an error when saving fails", async ({ page }) => {
		await page.route("**/api/dump", async (route) => {
			await route.fulfill({ status: 500, contentType: "application/json", body: "{}" });
		});

		await page.goto("/dump");
		const editor = page.getByPlaceholder(/input stream ready/i);
		await editor.pressSequentially("Keep this text so I can retry.");
		await page.getByRole("button", { name: /dump data/i }).click();

		await expect(page.getByText("Failed to store knowledge")).toBeVisible();
		await expect(editor).toHaveValue("Keep this text so I can retry.");
	});

	test("keeps dump submission disabled for empty input", async ({ page }) => {
		await page.goto("/dump");
		await expect(page.getByRole("button", { name: /dump data/i })).toBeDisabled();
	});
});
