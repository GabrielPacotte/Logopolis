import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environmentMatchGlobs: [["apps/web/**/*.test.tsx", "jsdom"]],
    exclude: [
      ...configDefaults.exclude,
      "apps/api/build/**",
      "apps/api/tests/**",
      "tests/e2e/**",
    ],
  },
});
