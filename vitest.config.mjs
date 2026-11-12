import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      "apps/api/build/**",
      "apps/api/tests/**",
      "tests/e2e/**",
    ],
  },
});
