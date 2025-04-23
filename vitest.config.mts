import { resolve } from "node:path"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [{ find: "@", replacement: resolve(__dirname, "./src") }],
  },
  root: ".",
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    setupFiles: "./vitest.setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["html"],
      include: ["**/*.tsx"],
    },
  },
})
