import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", () => ({ db: {} }));

import { fuseRankings } from "./vector-search";

const result = (id: string, rank: number) => ({
	id,
	content: id,
	distance: rank / 10,
	rank,
});

describe("fuseRankings", () => {
	it("uses reciprocal-rank fusion and resolves equal scores by lexical rank", () => {
		const fused = fuseRankings(
			[result("semantic", 1), result("exact-token", 2)],
			[result("exact-token", 1), result("semantic", 2)],
			2,
		);

		expect(fused.map(({ id }) => id)).toEqual(["exact-token", "semantic"]);
	});

	it("uses chunk id as the final stable tie-breaker", () => {
		const fused = fuseRankings(
			[result("chunk-b", 1), result("chunk-a", 1)],
			[],
			2,
		);

		expect(fused.map(({ id }) => id)).toEqual(["chunk-a", "chunk-b"]);
	});
});
