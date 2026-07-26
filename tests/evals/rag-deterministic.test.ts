import { describe, expect, it } from "vitest";
import {
	assertMinimumMetrics,
	corpus,
	currentVectorBaseline,
	currentVectorBaselineMetrics,
	EVAL_TOP_K,
	evaluateCorpus,
	metadataScopedVectorBaseline,
	metadataScopedVectorMetrics,
	recallAtK,
	reciprocalRank,
	validateCorpus,
} from "./schema";

describe("deterministic RAG evaluation", () => {
	it("computes Recall@K and reciprocal rank", () => {
		expect(recallAtK(["noise", "relevant"], ["relevant"], 3)).toBe(1);
		expect(reciprocalRank(["noise", "relevant"], ["relevant"])).toBe(0.5);
		expect(recallAtK(["noise"], ["relevant"], 3)).toBe(0);
	});

	it("covers the representative retrieval risks", () => {
		const tags = new Set(corpus.cases.flatMap((item) => item.tags));
		expect(tags).toEqual(
			new Set([
				"paraphrase",
				"error",
				"exact-identifier",
				"overlapping-notes",
				"metadata-scope",
				"type-scope",
				"tag-scope",
				"source-scope",
				"irrelevant",
				"no-answer",
			]),
		);
		expect(corpus.chunks).toHaveLength(12);
		expect(corpus.cases).toHaveLength(10);
	});

	it("rejects labels and grounded-answer expectations missing from the corpus", () => {
		expect(() =>
			validateCorpus({
				chunks: corpus.chunks,
				cases: [
					{
						...corpus.cases[0]!,
						relevantChunkIds: ["missing-chunk"],
						expectedAnswerFragments: ["invented answer"],
					},
				],
			}),
		).toThrow(
			/paraphrase-db-startup: relevant chunks are absent: missing-chunk/,
		);
	});

	it("reports the frozen current-vector retrieval baseline", () => {
		const report = evaluateCorpus(corpus, currentVectorBaseline, EVAL_TOP_K);
		expect(report.metrics).toEqual(currentVectorBaselineMetrics);
		expect(report.positiveCases).toBe(8);
		expect(report.negativeCases).toBe(2);
		expect(report.failures).toEqual([
			"favorite-color: expected no answer, retrieved [garden-note, user-profile-general, user-profile-identifier]",
			"travel-visa: expected no answer, retrieved [garden-note, user-profile-general, user-profile-identifier]",
		]);
	});

	it("evaluates metadata-scoped rankings without provider calls", () => {
		const scopedRankings = {
			...currentVectorBaseline,
			...metadataScopedVectorBaseline,
		};
		const report = evaluateCorpus(corpus, scopedRankings, EVAL_TOP_K);
		expect(report.metrics).toEqual(metadataScopedVectorMetrics);
		expect(metadataScopedVectorBaseline).toEqual({
			"type-scoped-deploy": [
				"deploy-personal",
				"auth-runbook",
				"postgres-startup-fix",
			],
			"tag-scoped-timeout": ["timeout-legacy"],
			"source-scoped-auth": ["auth-runbook"],
		});
	});

	it("is repeatable and emits actionable threshold failures", () => {
		const reports = Array.from({ length: 5 }, () =>
			evaluateCorpus(corpus, currentVectorBaseline),
		);
		expect(reports.every((report) => report.metrics.recallAtK === 1)).toBe(
			true,
		);
		expect(new Set(reports.map((report) => JSON.stringify(report))).size).toBe(
			1,
		);
		expect(() =>
			assertMinimumMetrics(reports[0]!, {
				...currentVectorBaselineMetrics,
				noAnswerAccuracy: 1,
			}),
		).toThrow(
			/favorite-color: expected no answer, retrieved \[garden-note, user-profile-general, user-profile-identifier\]/,
		);
	});
});
