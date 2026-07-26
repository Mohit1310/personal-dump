import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/library/library-browser", () => ({
	LibraryBrowser: () => {
		throw new Promise(() => {});
	},
}));

import LibraryPage from "./page";

describe("LibraryPage", () => {
	it("provides an accessible loading fallback while the search-parameter consumer suspends", () => {
		const html = renderToStaticMarkup(<LibraryPage />);

		expect(html).toContain('role="status"');
		expect(html).toContain("Loading library");
		expect(html.match(/animate-pulse/g)).toHaveLength(3);
	});
});
