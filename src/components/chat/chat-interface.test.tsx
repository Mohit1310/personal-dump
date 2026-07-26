// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatInterface } from "./chat-interface";

const { sendMessage, setMessages, toast, useChatMock } = vi.hoisted(() => ({
	sendMessage: vi.fn(),
	setMessages: vi.fn(),
	toast: { error: vi.fn() },
	useChatMock: vi.fn(),
}));
type TestChatStatus = "ready" | "streaming";
type TestChatState = {
	messages: Array<{
		id: string;
		role: string;
		parts: Array<{
			type: string;
			text?: string;
			sourceId?: string;
			title?: string;
			providerMetadata?: { custom?: { content?: string; score?: number } };
		}>;
	}>;
	status: TestChatStatus;
};
let chatState: TestChatState = { messages: [], status: "ready" };
vi.mock("sonner", () => ({ toast }));
vi.mock("ai", () => ({
	DefaultChatTransport: class {
		constructor(public options: unknown) {}
	},
}));
vi.mock("@ai-sdk/react", () => ({ useChat: useChatMock }));

describe("ChatInterface", () => {
	afterEach(() => cleanup());
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ models: ["model-a"] })),
				),
		);
		chatState = { messages: [], status: "ready" };
		useChatMock.mockImplementation(
			(options: { onError: (error: Error) => void }) => ({
				...chatState,
				sendMessage,
				setMessages,
				options,
			}),
		);
	});
	beforeEach(() => {
		HTMLElement.prototype.scrollIntoView = vi.fn();
	});

	it("shows suggestions and fills the input", async () => {
		const user = userEvent.setup();
		render(<ChatInterface />);
		await user.click(
			screen.getByRole("button", { name: "Summarize my recent notes" }),
		);
		expect(screen.getByPlaceholderText(/enter command/i)).toHaveValue(
			"Summarize my recent notes",
		);
	});

	it("blocks empty submit and clears the chat", async () => {
		const user = userEvent.setup();
		render(<ChatInterface />);
		await user.click(screen.getByRole("button", { name: "Submit" }));
		expect(sendMessage).not.toHaveBeenCalled();
		await user.click(screen.getByRole("button", { name: "Clear" }));
		expect(setMessages).toHaveBeenCalledWith([]);
	});

	it("renders streamed answer, reasoning, and sources", async () => {
		chatState = {
			status: "streaming",
			messages: [
				{
					id: "a",
					role: "assistant",
					parts: [
						{ type: "text", text: "<think>check context</think>Answer" },
						{
							type: "source-document",
							sourceId: "s1",
							title: "Dump source",
							providerMetadata: {
								custom: { content: "Relevant note", score: 0.9 },
							},
						},
					],
				},
			],
		};
		render(<ChatInterface />);
		expect(screen.getByText("Answer")).toBeInTheDocument();
		expect(screen.getByText("check context")).toBeInTheDocument();
		await userEvent
			.setup()
			.click(screen.getByRole("button", { name: /sources/i }));
		expect(screen.getByText("Dump source")).toBeInTheDocument();
	});

	it("notifies on chat errors", async () => {
		render(<ChatInterface />);
		const options = useChatMock.mock.calls[0]?.[0] as {
			onError: (error: Error) => void;
		};
		options.onError(new Error("broken"));
		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				"Query failed. Please try again.",
			),
		);
	});
});
