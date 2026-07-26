import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
	throw new Error(
		"TEST_DATABASE_URL is required for integration tests (for example: TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/personal_dump_test pnpm test:integration)",
	);
}

let databaseName: string;
try {
	databaseName = decodeURIComponent(new URL(testDatabaseUrl).pathname.slice(1));
} catch {
	throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL URL");
}

if (!/(^|[-_])(test|testing|integration)([-_]|$)/i.test(databaseName)) {
	throw new Error(
		`Refusing integration tests: TEST_DATABASE_URL must point to a test database, got "${databaseName}"`,
	);
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.GEMINI_API_KEY ??= "integration-test";
process.env.GROQ_API_KEY ??= "integration-test";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		include: ["tests/integration/**/*.test.ts"],
		setupFiles: ["./vitest.setup.ts"],
		pool: "forks",
		poolOptions: { forks: { singleFork: true } },
	},
});
