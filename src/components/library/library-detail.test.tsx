// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryDetail } from "./library-detail";

const dump = (overrides: Record<string, unknown> = {}) => ({
	id: "a4e96812-a162-42c8-abcc-a3c24688d20f",
	content: "Original stored content",
	title: "Database setup",
	type: "solution" as const,
	tags: ["database", "prisma"],
	source: "Shell history",
	createdAt: "2026-07-26T12:00:00.000Z",
	updatedAt: "2026-07-26T13:00:00.000Z",
	...overrides,
});

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status });

describe("LibraryDetail", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ dump: dump() })));
	});

	afterEach(() => cleanup());

	it("renders content, user-managed metadata, and accessible navigation without derived records", async () => {
		render(<LibraryDetail dumpId={dump().id} />);

		await screen.findByRole("heading", { name: "Database setup" });
		expect(
			screen.getByRole("link", { name: /back to library/i }),
		).toHaveAttribute("href", "/library");
		expect(screen.getByLabelText("Dump content")).toHaveValue(
			"Original stored content",
		);
		expect(screen.getByLabelText("Tags")).toHaveValue("database, prisma");
		expect(screen.queryByText(/chunks created/i)).not.toBeInTheDocument();
	});

	it("saves metadata, displays unsaved state, and sends the established PATCH shape", async () => {
		const updated = dump({ title: "Updated database setup", tags: ["prisma"] });
		vi.mocked(fetch)
			.mockResolvedValueOnce(json({ dump: dump() }))
			.mockResolvedValueOnce(json({ dump: updated }));
		const user = userEvent.setup();
		render(<LibraryDetail dumpId={dump().id} />);

		const title = await screen.findByLabelText("Title");
		await user.clear(title);
		await user.type(title, "Updated database setup");
		await user.clear(screen.getByLabelText("Tags"));
		await user.type(screen.getByLabelText("Tags"), "prisma");
		expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Save metadata" }));

		await waitFor(() =>
			expect(fetch).toHaveBeenLastCalledWith(
				`/api/dumps/${dump().id}`,
				expect.objectContaining({
					method: "PATCH",
					body: JSON.stringify({
						title: "Updated database setup",
						type: "solution",
						tags: ["prisma"],
						source: "Shell history",
					}),
				}),
			),
		);
		expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
	});

	it("keeps edited content and reports the failure when re-indexing fails", async () => {
		vi.mocked(fetch)
			.mockResolvedValueOnce(json({ dump: dump() }))
			.mockResolvedValueOnce(
				json({ error: "Failed to update dump content" }, 500),
			);
		const user = userEvent.setup();
		render(<LibraryDetail dumpId={dump().id} />);

		const content = await screen.findByLabelText("Dump content");
		await user.clear(content);
		await user.type(content, "Keep this replacement content");
		await user.click(screen.getByRole("button", { name: "Re-index content" }));

		await screen.findByRole("alert");
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Failed to update dump content",
		);
		expect(content).toHaveValue("Keep this replacement content");
	});

	it("requires typed confirmation and preserves the dialog after a delete failure", async () => {
		vi.mocked(fetch)
			.mockResolvedValueOnce(json({ dump: dump() }))
			.mockResolvedValueOnce(json({ error: "Failed to delete dump" }, 500));
		const user = userEvent.setup();
		render(<LibraryDetail dumpId={dump().id} />);

		await screen.findByRole("heading", { name: "Database setup" });
		await user.click(screen.getByRole("button", { name: "Delete dump" }));
		const confirmation = screen.getByLabelText("Confirmation");
		expect(confirmation).toHaveFocus();
		expect(
			screen.getByRole("button", { name: "Delete permanently" }),
		).toBeDisabled();
		await user.type(confirmation, "DELETE");
		await user.click(
			screen.getByRole("button", { name: "Delete permanently" }),
		);

		await screen.findByRole("alert");
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(confirmation).toHaveValue("DELETE");
		expect(fetch).toHaveBeenLastCalledWith(`/api/dumps/${dump().id}`, {
			method: "DELETE",
		});
	});

	it("shows the not-found state", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(
			json({ error: "Dump not found" }, 404),
		);
		render(<LibraryDetail dumpId={dump().id} />);

		await screen.findByRole("alert");
		expect(
			screen.getByRole("heading", { name: "Dump not found" }),
		).toBeVisible();
	});
});
