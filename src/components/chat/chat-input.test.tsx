// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import ChatInput from "./chat-input";

const props = (overrides = {}) => ({
	inputValue: "",
	isModelSelectorOpen: false,
	onInputChange: vi.fn(),
	onModelSelectorOpenChange: vi.fn(),
	onSubmit: vi.fn(),
	status: "ready" as const,
	...overrides,
});

describe("ChatInput", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect() {}
			},
		);
		HTMLElement.prototype.scrollIntoView = vi.fn();
	});
	afterEach(() => cleanup());
	it("uses the fallback model when loading fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		render(<ChatInput {...props()} />);
		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: /openai\/gpt-oss-120b/i }),
			).toBeInTheDocument(),
		);
	});

	it("loads, selects, and submits a model", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ models: ["model-a", "model-b"] })),
				),
		);
		const onSubmit = vi.fn();
		const user = userEvent.setup();
		function Harness() {
			const [open, setOpen] = useState(false);
			const [value, setValue] = useState("");
			return (
				<ChatInput
					{...props({
						onSubmit,
						inputValue: value,
						onInputChange: setValue,
						isModelSelectorOpen: open,
						onModelSelectorOpenChange: setOpen,
					})}
				/>
			);
		}
		render(<Harness />);
		await waitFor(() =>
			expect(screen.getByText("model-a")).toBeInTheDocument(),
		);
		fireEvent.click(screen.getByRole("button", { name: /model-a/i }));
		const dialog = await screen.findByRole("dialog");
		await user.click(within(dialog).getByText("model-b"));
		await user.type(screen.getByPlaceholderText(/enter command/i), "find it");
		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() =>
			expect(onSubmit).toHaveBeenCalledWith("find it", "model-b"),
		);
	});
});
