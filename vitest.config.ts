import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		exclude: [
			"node_modules/**",
			".next/**",
			"build/**",
			"tests/e2e/**",
			"tests/evals/**",
			"tests/integration/**",
		],
		setupFiles: ["./vitest.setup.ts"],
	},
});
