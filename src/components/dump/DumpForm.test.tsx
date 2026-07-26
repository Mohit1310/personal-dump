// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DumpForm } from "./DumpForm";

const { toast } = vi.hoisted(() => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock("sonner", () => ({ toast }));

describe("DumpForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", vi.fn());
	});
	afterEach(() => cleanup());

	it("keeps the save action disabled for empty and whitespace input", async () => {
		const user = userEvent.setup();
		render(<DumpForm />);
		const button = screen.getByRole("button", { name: /dump data/i });
		expect(button).toBeDisabled();
		await user.type(screen.getByPlaceholderText(/input stream ready/i), "   ");
		expect(button).toBeDisabled();
	});

	it("posts the selected type and content", async () => {
		const fetchMock = vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
		const user = userEvent.setup();
		render(<DumpForm />);
		await user.click(screen.getByRole("button", { name: "Error" }));
		await user.type(screen.getByPlaceholderText(/input stream ready/i), "Error details");
		await user.click(screen.getByRole("button", { name: /dump data/i }));
		await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/dump", expect.objectContaining({ body: JSON.stringify({ content: "Error details", type: "error" }) })));
	});

	it.each(["Control", "Meta"])("submits with %s+Enter", async (modifier) => {
		const fetchMock = vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));
		const user = userEvent.setup();
		render(<DumpForm />);
		const input = screen.getByPlaceholderText(/input stream ready/i);
		await user.type(input, "shortcut");
		if (modifier === "Control") {
			await userEvent.setup().keyboard("{Control>}{Enter}{/Control}");
		} else {
			fireEvent.keyDown(input, { key: "Enter", code: "Enter", metaKey: true });
		}
		await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
	});

	it("prevents duplicate saves while loading", async () => {
		let resolve: (value: Response) => void = () => undefined;
		vi.mocked(fetch).mockReturnValue(new Promise((r) => { resolve = r; }));
		const user = userEvent.setup();
		render(<DumpForm />);
		await user.type(screen.getByPlaceholderText(/input stream ready/i), "once");
		await user.click(screen.getByRole("button", { name: /dump data/i }));
		await user.click(screen.getByRole("button", { name: /processing/i }));
		expect(fetch).toHaveBeenCalledTimes(1);
		resolve(new Response(null, { status: 200 }));
	});

	it("clears after success and retains content after failure", async () => {
		const user = userEvent.setup();
		render(<DumpForm />);
		const input = screen.getByPlaceholderText(/input stream ready/i);
		vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));
		await user.type(input, "saved");
		await user.click(screen.getByRole("button", { name: /dump data/i }));
		await waitFor(() => expect(input).toHaveValue(""));
		expect(toast.success).toHaveBeenCalledWith("Knowledge stored successfully!");
		vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));
		await user.type(input, "retry me");
		await user.click(screen.getByRole("button", { name: /saved/i }));
		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Failed to store knowledge"));
		expect(input).toHaveValue("retry me");
	});
});
