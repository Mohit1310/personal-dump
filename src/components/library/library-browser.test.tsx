// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryBrowser } from "./library-browser";

const { pathname, replace, searchParams } = vi.hoisted(() => ({
	pathname: "/library",
	replace: vi.fn(),
	searchParams: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => pathname,
	useRouter: () => ({ replace }),
	useSearchParams: () => searchParams,
}));

const libraryResponse = (overrides: Record<string, unknown> = {}) => ({
	dumps: [
		{
			id: "dump-1",
			title: "",
			type: "solution",
			tags: ["database-setup"],
			source: "Shell history",
			createdAt: "2026-07-26T12:00:00.000Z",
			updatedAt: "2026-07-26T13:00:00.000Z",
		},
	],
	pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
	...overrides,
});

describe("LibraryBrowser", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		searchParams.forEach((_, key) => searchParams.delete(key));
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify(libraryResponse()), { status: 200 }),
				),
		);
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
	});

	it("renders metadata-rich results with title fallback and accessible detail navigation", async () => {
		render(<LibraryBrowser />);

		await screen.findByText("Untitled solution");
		expect(screen.getByText("database-setup")).toBeInTheDocument();
		expect(screen.getByText(/source: shell history/i)).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /untitled solution/i }),
		).toHaveAttribute("href", "/library/dump-1");
		expect(screen.getByText("1 stored items")).toBeInTheDocument();
	});

	it("keeps search state shareable and debounces URL updates", async () => {
		vi.useFakeTimers();
		render(<LibraryBrowser />);
		await vi.advanceTimersByTimeAsync(0);
		fireEvent.change(screen.getByRole("textbox", { name: /search library/i }), {
			target: { value: "prisma" },
		});

		await vi.advanceTimersByTimeAsync(299);
		expect(replace).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1);
		expect(replace).toHaveBeenCalledWith("/library?q=prisma&page=1", {
			scroll: false,
		});
	});

	it("renders an empty state that can clear active filters", async () => {
		searchParams.set("type", "error");
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify(
					libraryResponse({
						dumps: [],
						pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
					}),
				),
				{ status: 200 },
			),
		);
		render(<LibraryBrowser />);

		await screen.findByText("No matching knowledge");
		await userEvent
			.setup()
			.click(screen.getByRole("button", { name: "Show all items" }));
		expect(replace).toHaveBeenCalledWith("/library?page=1", {
			scroll: false,
		});
	});

	it("shows an accessible loading state, failure state, and retries the request", async () => {
		vi.mocked(fetch)
			.mockRejectedValueOnce(new Error("offline"))
			.mockResolvedValueOnce(
				new Response(JSON.stringify(libraryResponse()), { status: 200 }),
			);
		render(<LibraryBrowser />);

		expect(screen.getByRole("status")).toHaveTextContent(
			"Loading library results",
		);
		await screen.findByRole("alert");
		await userEvent
			.setup()
			.click(screen.getByRole("button", { name: /retry/i }));
		await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
		await screen.findByText("Untitled solution");
	});

	it("uses labelled pagination controls and preserves filter state when changing pages", async () => {
		searchParams.set("q", "prisma");
		vi.mocked(fetch).mockResolvedValueOnce(
			new Response(
				JSON.stringify(
					libraryResponse({
						pagination: { page: 1, pageSize: 20, total: 21, totalPages: 2 },
					}),
				),
				{ status: 200 },
			),
		);
		render(<LibraryBrowser />);

		await screen.findByRole("navigation", { name: "Library pagination" });
		expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
		await userEvent
			.setup()
			.click(screen.getByRole("button", { name: /next/i }));
		expect(replace).toHaveBeenCalledWith("/library?q=prisma&page=2", {
			scroll: false,
		});
	});
});
