import {
	type RetrievalFilters,
	retrievalFiltersSchema,
} from "../../src/lib/retrieval/filters";

export interface EvalChunk {
	id: string;
	content: string;
	embedding: number[];
	metadata: {
		type: "note" | "error" | "solution";
		tags: string[];
		source: string;
	};
}

export interface EvalCase {
	id: string;
	query: string;
	queryEmbedding: number[];
	relevantChunkIds: string[];
	expectedAnswerFragments: string[];
	mustRefuse?: boolean;
	scope?: RetrievalFilters;
	tags: string[];
}

export interface EvalCorpus {
	chunks: EvalChunk[];
	cases: EvalCase[];
}

export interface EvaluationMetrics {
	recallAtK: number;
	meanReciprocalRank: number;
	noAnswerAccuracy: number;
	groundedAnswerAccuracy: number;
}

export interface EvaluationReport {
	metrics: EvaluationMetrics;
	failures: string[];
	positiveCases: number;
	negativeCases: number;
	topK: number;
}

export const EVAL_TOP_K = 3;

const fixtureEmbedding = (
	values: Record<number, number>,
	order: number,
): number[] =>
	Array.from({ length: 16 }, (_, index) =>
		index === 15 ? order : (values[index] ?? 0),
	);

export const corpus: EvalCorpus = {
	chunks: [
		{
			id: "postgres-startup-fix",
			content:
				"Error: ECONNREFUSED on local startup. Solution: start PostgreSQL before running the app.",
			embedding: fixtureEmbedding({ 0: 1 }, 0.001),
			metadata: {
				type: "solution",
				tags: ["postgres", "local-dev"],
				source: "troubleshooting",
			},
		},
		{
			id: "pnpm-lockfile-error",
			content:
				"ERR_PNPM_OUTDATED_LOCKFILE: run `pnpm install --frozen-lockfile=false`, then commit the updated pnpm-lock.yaml.",
			embedding: fixtureEmbedding({ 2: 0.9, 3: 0.435 }, 0.002),
			metadata: {
				type: "error",
				tags: ["pnpm", "ci"],
				source: "ci-runbook",
			},
		},
		{
			id: "pnpm-install-note",
			content:
				"Use `pnpm install --frozen-lockfile` in CI to prevent lockfile drift.",
			embedding: fixtureEmbedding({ 2: 1 }, 0.003),
			metadata: {
				type: "note",
				tags: ["pnpm", "ci"],
				source: "notes",
			},
		},
		{
			id: "timeout-current",
			content: "The current API request timeout is 10 seconds.",
			embedding: fixtureEmbedding({ 4: 1 }, 0.004),
			metadata: {
				type: "note",
				tags: ["api", "timeout"],
				source: "architecture",
			},
		},
		{
			id: "timeout-legacy",
			content: "The legacy worker timeout was 5 seconds.",
			embedding: fixtureEmbedding({ 4: 0.98, 5: 0.199 }, 0.005),
			metadata: {
				type: "note",
				tags: ["worker", "timeout"],
				source: "migration-notes",
			},
		},
		{
			id: "deploy-personal",
			content:
				"Solution dump for Atlas deployment: run `pnpm deploy:personal`.",
			embedding: fixtureEmbedding({ 6: 0.95, 7: 0.312 }, 0.006),
			metadata: {
				type: "solution",
				tags: ["atlas", "deploy"],
				source: "personal",
			},
		},
		{
			id: "deploy-work",
			content: "Work note for Atlas deployment: run `pnpm deploy:work`.",
			embedding: fixtureEmbedding({ 6: 1 }, 0.007),
			metadata: {
				type: "note",
				tags: ["atlas", "deploy"],
				source: "work",
			},
		},
		{
			id: "auth-runbook",
			content: "The authentication runbook says to run `pnpm auth:reset`.",
			embedding: fixtureEmbedding({ 8: 0.94, 9: 0.341 }, 0.008),
			metadata: {
				type: "solution",
				tags: ["auth"],
				source: "runbook",
			},
		},
		{
			id: "auth-meeting",
			content:
				"Meeting note: discuss replacing the authentication provider next quarter.",
			embedding: fixtureEmbedding({ 8: 1 }, 0.009),
			metadata: {
				type: "note",
				tags: ["auth"],
				source: "meeting",
			},
		},
		{
			id: "user-profile-identifier",
			content:
				"`UserProfileService` owns profile cache invalidation after an update.",
			embedding: fixtureEmbedding({ 10: 0.92, 11: 0.392 }, 0.01),
			metadata: {
				type: "note",
				tags: ["typescript", "profiles"],
				source: "code-notes",
			},
		},
		{
			id: "user-profile-general",
			content: "User profiles are cached after they are loaded.",
			embedding: fixtureEmbedding({ 10: 1 }, 0.011),
			metadata: {
				type: "note",
				tags: ["profiles"],
				source: "architecture",
			},
		},
		{
			id: "garden-note",
			content: "Water the balcony herbs every Saturday morning.",
			embedding: fixtureEmbedding({ 14: 1 }, 0.012),
			metadata: {
				type: "note",
				tags: ["home"],
				source: "personal",
			},
		},
	],
	cases: [
		{
			id: "paraphrase-db-startup",
			query: "What needs to be running before the app can reach my local DB?",
			queryEmbedding: fixtureEmbedding({ 0: 1 }, 0.01),
			relevantChunkIds: ["postgres-startup-fix"],
			expectedAnswerFragments: ["start PostgreSQL before running the app"],
			tags: ["paraphrase"],
		},
		{
			id: "connection-error",
			query: "How did I fix ECONNREFUSED during local startup?",
			queryEmbedding: fixtureEmbedding({ 0: 1 }, 0.01),
			relevantChunkIds: ["postgres-startup-fix"],
			expectedAnswerFragments: ["start PostgreSQL before running the app"],
			tags: ["error"],
		},
		{
			id: "exact-pnpm-error",
			query: "How do I fix ERR_PNPM_OUTDATED_LOCKFILE?",
			queryEmbedding: fixtureEmbedding({ 2: 1 }, 0.01),
			relevantChunkIds: ["pnpm-lockfile-error"],
			expectedAnswerFragments: ["pnpm install --frozen-lockfile=false"],
			tags: ["exact-identifier", "error"],
		},
		{
			id: "overlapping-timeouts",
			query: "What timeout values have I recorded?",
			queryEmbedding: fixtureEmbedding({ 4: 1 }, 0.01),
			relevantChunkIds: ["timeout-current", "timeout-legacy"],
			expectedAnswerFragments: ["10 seconds", "5 seconds"],
			tags: ["overlapping-notes"],
		},
		{
			id: "type-scoped-deploy",
			query: "In solution dumps, how do I deploy Atlas?",
			queryEmbedding: fixtureEmbedding({ 6: 1 }, 0.01),
			relevantChunkIds: ["deploy-personal"],
			expectedAnswerFragments: ["pnpm deploy:personal"],
			scope: { type: "solution" },
			tags: ["metadata-scope", "type-scope"],
		},
		{
			id: "tag-scoped-timeout",
			query: "In notes tagged worker, what timeout did I record?",
			queryEmbedding: fixtureEmbedding({ 4: 1 }, 0.01),
			relevantChunkIds: ["timeout-legacy"],
			expectedAnswerFragments: ["5 seconds"],
			scope: { tag: "worker" },
			tags: ["metadata-scope", "tag-scope"],
		},
		{
			id: "source-scoped-auth",
			query: "According to the runbook, how do I reset authentication?",
			queryEmbedding: fixtureEmbedding({ 8: 1 }, 0.01),
			relevantChunkIds: ["auth-runbook"],
			expectedAnswerFragments: ["pnpm auth:reset"],
			scope: { source: "runbook" },
			tags: ["metadata-scope", "source-scope"],
		},
		{
			id: "exact-service-identifier",
			query: "What does UserProfileService do after an update?",
			queryEmbedding: fixtureEmbedding({ 10: 1 }, 0.01),
			relevantChunkIds: ["user-profile-identifier"],
			expectedAnswerFragments: ["profile cache invalidation"],
			tags: ["exact-identifier"],
		},
		{
			id: "favorite-color",
			query: "What is my favorite color?",
			queryEmbedding: fixtureEmbedding({ 14: 1 }, 0.01),
			relevantChunkIds: [],
			expectedAnswerFragments: [],
			mustRefuse: true,
			tags: ["irrelevant", "no-answer"],
		},
		{
			id: "travel-visa",
			query: "Which visa do I need for Japan?",
			queryEmbedding: fixtureEmbedding({ 14: 1 }, 0.01),
			relevantChunkIds: [],
			expectedAnswerFragments: [],
			mustRefuse: true,
			tags: ["irrelevant", "no-answer"],
		},
	],
};

export const currentVectorBaseline: Record<string, string[]> = {
	"paraphrase-db-startup": [
		"postgres-startup-fix",
		"garden-note",
		"user-profile-general",
	],
	"connection-error": [
		"postgres-startup-fix",
		"garden-note",
		"user-profile-general",
	],
	"exact-pnpm-error": [
		"pnpm-install-note",
		"pnpm-lockfile-error",
		"garden-note",
	],
	"overlapping-timeouts": ["timeout-current", "timeout-legacy", "garden-note"],
	"type-scoped-deploy": ["deploy-work", "deploy-personal", "garden-note"],
	"tag-scoped-timeout": ["timeout-current", "timeout-legacy", "garden-note"],
	"source-scoped-auth": ["auth-meeting", "auth-runbook", "garden-note"],
	"exact-service-identifier": [
		"user-profile-general",
		"user-profile-identifier",
		"garden-note",
	],
	"favorite-color": [
		"garden-note",
		"user-profile-general",
		"user-profile-identifier",
	],
	"travel-visa": [
		"garden-note",
		"user-profile-general",
		"user-profile-identifier",
	],
};

export const currentVectorBaselineMetrics: EvaluationMetrics = {
	recallAtK: 1,
	meanReciprocalRank: 5.5 / 8,
	noAnswerAccuracy: 0,
	groundedAnswerAccuracy: 1,
};

export const metadataScopedVectorBaseline: Record<string, string[]> = {
	"type-scoped-deploy": [
		"deploy-personal",
		"auth-runbook",
		"postgres-startup-fix",
	],
	"tag-scoped-timeout": ["timeout-legacy"],
	"source-scoped-auth": ["auth-runbook"],
};

export const metadataScopedVectorMetrics: EvaluationMetrics = {
	recallAtK: 1,
	meanReciprocalRank: 7 / 8,
	noAnswerAccuracy: 0,
	groundedAnswerAccuracy: 1,
};

const chunkMatchesScope = (
	chunk: EvalChunk,
	scope: RetrievalFilters,
): boolean =>
	(!scope.type || chunk.metadata.type === scope.type) &&
	(!scope.tag || chunk.metadata.tags.includes(scope.tag)) &&
	(!scope.source ||
		chunk.metadata.source.toLocaleLowerCase() ===
			scope.source.toLocaleLowerCase());

export function recallAtK(
	retrieved: string[],
	relevant: string[],
	topK: number,
): number {
	return relevant.length === 0
		? 1
		: relevant.filter((id) => retrieved.slice(0, topK).includes(id)).length /
				relevant.length;
}

export function reciprocalRank(
	retrieved: string[],
	relevant: string[],
): number {
	const index = retrieved.findIndex((id) => relevant.includes(id));
	return index < 0 ? 0 : 1 / (index + 1);
}

export function validateCorpus(evalCorpus: EvalCorpus): void {
	const problems: string[] = [];
	const chunkIds = evalCorpus.chunks.map(({ id }) => id);
	const knownChunkIds = new Set(chunkIds);

	for (const id of new Set(chunkIds)) {
		if (chunkIds.filter((candidate) => candidate === id).length > 1) {
			problems.push(`duplicate chunk id "${id}"`);
		}
	}

	for (const item of evalCorpus.cases) {
		const parsedScope = retrievalFiltersSchema.safeParse(item.scope ?? {});
		if (!parsedScope.success) {
			problems.push(`${item.id}: invalid metadata scope`);
		}
		const missingIds = item.relevantChunkIds.filter(
			(id) => !knownChunkIds.has(id),
		);
		if (missingIds.length > 0) {
			problems.push(
				`${item.id}: relevant chunks are absent: ${missingIds.join(", ")}`,
			);
		}
		if (item.mustRefuse && item.relevantChunkIds.length > 0) {
			problems.push(`${item.id}: refusal cases cannot label relevant chunks`);
		}
		if (!item.mustRefuse && item.relevantChunkIds.length === 0) {
			problems.push(`${item.id}: positive cases need a relevant chunk`);
		}
		const outOfScopeIds = item.relevantChunkIds.filter((id) => {
			const chunk = evalCorpus.chunks.find((candidate) => candidate.id === id);
			return (
				chunk &&
				parsedScope.success &&
				!chunkMatchesScope(chunk, parsedScope.data)
			);
		});
		if (outOfScopeIds.length > 0) {
			problems.push(
				`${item.id}: relevant chunks fall outside metadata scope: ${outOfScopeIds.join(", ")}`,
			);
		}

		const relevantContent = evalCorpus.chunks
			.filter(({ id }) => item.relevantChunkIds.includes(id))
			.map(({ content }) => content.toLocaleLowerCase());
		const unsupportedFragments = item.expectedAnswerFragments.filter(
			(fragment) =>
				!relevantContent.some((content) =>
					content.includes(fragment.toLocaleLowerCase()),
				),
		);
		if (unsupportedFragments.length > 0) {
			problems.push(
				`${item.id}: answer fragments are absent from labeled chunks: ${unsupportedFragments.join(", ")}`,
			);
		}
	}

	if (problems.length > 0) {
		throw new Error(`Invalid eval corpus:\n- ${problems.join("\n- ")}`);
	}
}

export function evaluateCorpus(
	evalCorpus: EvalCorpus,
	rankings: Record<string, string[]>,
	topK = EVAL_TOP_K,
): EvaluationReport {
	validateCorpus(evalCorpus);
	const failures: string[] = [];
	const knownChunkIds = new Set(evalCorpus.chunks.map(({ id }) => id));
	const positiveCases = evalCorpus.cases.filter((item) => !item.mustRefuse);
	const negativeCases = evalCorpus.cases.filter((item) => item.mustRefuse);

	for (const item of evalCorpus.cases) {
		if (!(item.id in rankings)) {
			throw new Error(`Missing retrieval ranking for eval case "${item.id}"`);
		}
		const unknownIds = rankings[item.id]!.filter(
			(id) => !knownChunkIds.has(id),
		);
		if (unknownIds.length > 0) {
			throw new Error(
				`${item.id}: retrieval ranking contains unknown chunks: ${unknownIds.join(", ")}`,
			);
		}
	}

	const recalls = positiveCases.map((item) => {
		const retrieved = rankings[item.id]!.slice(0, topK);
		const recall = recallAtK(retrieved, item.relevantChunkIds, topK);
		const missingIds = item.relevantChunkIds.filter(
			(id) => !retrieved.includes(id),
		);
		if (missingIds.length > 0) {
			failures.push(
				`${item.id}: Recall@${topK}=${recall}; missing [${missingIds.join(", ")}], retrieved [${retrieved.join(", ")}]`,
			);
		}
		return recall;
	});

	const reciprocalRanks = positiveCases.map((item) =>
		reciprocalRank(rankings[item.id]!.slice(0, topK), item.relevantChunkIds),
	);

	const noAnswerResults = negativeCases.map((item) => {
		const retrieved = rankings[item.id]!.slice(0, topK);
		const correct = retrieved.length === 0;
		if (!correct) {
			failures.push(
				`${item.id}: expected no answer, retrieved [${retrieved.join(", ")}]`,
			);
		}
		return correct ? 1 : 0;
	});

	const groundedResults = positiveCases.map((item) => {
		const retrievedRelevantContent = evalCorpus.chunks
			.filter(
				({ id }) =>
					item.relevantChunkIds.includes(id) &&
					rankings[item.id]!.slice(0, topK).includes(id),
			)
			.map(({ content }) => content.toLocaleLowerCase());
		const unsupportedFragments = item.expectedAnswerFragments.filter(
			(fragment) =>
				!retrievedRelevantContent.some((content) =>
					content.includes(fragment.toLocaleLowerCase()),
				),
		);
		if (unsupportedFragments.length > 0) {
			failures.push(
				`${item.id}: expected answer is not grounded by retrieved relevant chunks; unsupported [${unsupportedFragments.join(", ")}]`,
			);
		}
		return unsupportedFragments.length === 0 ? 1 : 0;
	});

	const mean = (values: number[]) =>
		values.reduce((total, value) => total + value, 0) / values.length;

	return {
		metrics: {
			recallAtK: mean(recalls),
			meanReciprocalRank: mean(reciprocalRanks),
			noAnswerAccuracy: mean(noAnswerResults),
			groundedAnswerAccuracy: mean(groundedResults),
		},
		failures,
		positiveCases: positiveCases.length,
		negativeCases: negativeCases.length,
		topK,
	};
}

export function assertMinimumMetrics(
	report: EvaluationReport,
	minimum: EvaluationMetrics,
): void {
	const belowMinimum = (
		Object.entries(minimum) as Array<
			[keyof EvaluationMetrics, EvaluationMetrics[keyof EvaluationMetrics]]
		>
	).filter(([metric, threshold]) => report.metrics[metric] < threshold);

	if (belowMinimum.length > 0) {
		const metricDiffs = belowMinimum
			.map(
				([metric, threshold]) =>
					`${metric}: expected >= ${threshold}, received ${report.metrics[metric]}`,
			)
			.join("\n- ");
		throw new Error(
			`Evaluation thresholds failed:\n- ${metricDiffs}\nCase failures:\n- ${report.failures.join("\n- ")}`,
		);
	}
}
