import vitestPlugin from "eslint-plugin-vitest"
import prettierPlugin from "eslint-plugin-prettier"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["dist"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    plugins: { vitest: vitestPlugin },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
    },
  },
)
