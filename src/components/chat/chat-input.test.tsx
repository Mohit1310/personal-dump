// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ChatInput from "./chat-input";

const props = (overrides = {}) => ({ inputValue: "", isModelSelectorOpen: false, onInputChange: vi.fn(), onModelSelectorOpenChange: vi.fn(), onSubmit: vi.fn(), status: "ready" as const, ...overrides });

describe("ChatInput", () => {
	it("uses the fallback model when loading fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		render(<ChatInput {...props()} />);
		await waitFor(() => expect(screen.getByRole("button", { name: /openai\/gpt-oss-120b/i })).toBeInTheDocument());
	});

	it("loads, selects, and submits a model", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: ["model-a", "model-b"] }))));
		const onSubmit = vi.fn();
		const user = userEvent.setup();
		render(<ChatInput {...props({ onSubmit })} />);
		await waitFor(() => expect(screen.getByText("model-a")).toBeInTheDocument());
		await user.click(screen.getByRole("button", { name: /model-a/i }));
		await user.click(screen.getByRole("option", { name: "model-b" }));
		await user.type(screen.getByPlaceholderText(/enter command/i), "find it");
		await user.click(screen.getByRole("button", { name: "Submit" }));
		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("find it", "model-b"));
	});
});
