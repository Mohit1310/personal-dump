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
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

const stubSuccessfulRequests = (
	dumps: Array<{ tags: string[]; source: string }> = [],
) => {
	vi.stubGlobal(
		"fetch",
		vi.fn((input: RequestInfo | URL) =>
			Promise.resolve(
				new Response(
					JSON.stringify(
						String(input).includes("/api/dumps")
							? { dumps }
							: { models: ["model-a", "model-b"] },
					),
				),
			),
		),
	);
};

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

	it("uses the fallback model and keeps unfiltered chat available when loading fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		render(<ChatInput {...props()} />);
		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: /openai\/gpt-oss-120b/i }),
			).toBeInTheDocument(),
		);
		expect(
			await screen.findByText(
				"Saved tags and sources are unavailable. Unfiltered chat still works.",
			),
		).toBeInTheDocument();
	});

	it("loads, selects, and submits a model", async () => {
		stubSuccessfulRequests();
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
			expect(onSubmit).toHaveBeenCalledWith("find it", "model-b", undefined),
		);
	});

	it("selects, submits, and clears an accessible knowledge scope", async () => {
		stubSuccessfulRequests([
			{ tags: ["database-setup"], source: "Shell history" },
		]);
		const onSubmit = vi.fn();
		const user = userEvent.setup();
		render(
			<ChatInput
				{...props({
					inputValue: "find it",
					onSubmit,
				})}
			/>,
		);

		await user.selectOptions(
			screen.getByRole("combobox", { name: "Knowledge type scope" }),
			"solution",
		);
		await user.selectOptions(
			await screen.findByRole("combobox", { name: "Knowledge tag scope" }),
			"database-setup",
		);
		await user.selectOptions(
			screen.getByRole("combobox", { name: "Knowledge source scope" }),
			"Shell history",
		);
		expect(screen.getByText("3 active")).toBeInTheDocument();

		await user.keyboard("{Tab}");
		await user.click(screen.getByRole("button", { name: "Submit" }));
		expect(onSubmit).toHaveBeenCalledWith("find it", "model-a", {
			type: "solution",
			tag: "database-setup",
			source: "Shell history",
		});

		await user.click(screen.getByRole("button", { name: "Clear scope" }));
		expect(screen.getByText("All knowledge")).toBeInTheDocument();
		expect(
			screen.getByRole("combobox", { name: "Knowledge type scope" }),
		).toHaveValue("");
	});

	it("shows empty scope controls without blocking unfiltered submit", async () => {
		stubSuccessfulRequests();
		const onSubmit = vi.fn();
		const user = userEvent.setup();
		render(
			<ChatInput
				{...props({
					inputValue: "all knowledge",
					onSubmit,
				})}
			/>,
		);

		expect(
			await screen.findByRole("combobox", { name: "Knowledge tag scope" }),
		).toBeDisabled();
		expect(
			screen.getByRole("option", { name: "No tags available" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("combobox", { name: "Knowledge source scope" }),
		).toBeDisabled();
		await user.click(screen.getByRole("button", { name: "Submit" }));
		expect(onSubmit).toHaveBeenCalledWith(
			"all knowledge",
			"model-a",
			undefined,
		);
	});
});
