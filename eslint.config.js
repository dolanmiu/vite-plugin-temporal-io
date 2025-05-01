import js from "@eslint/js";
// eslint-disable-next-line import/no-unresolved
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
// eslint-disable-next-line import/no-unresolved
import tseslint from "typescript-eslint";

export default defineConfig([
  tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: { js },
    extends: ["js/recommended"],
    rules: {
      "sort-imports": [
        "error",
        {
          allowSeparatedGroups: true,
          ignoreDeclarationSort: true,
        },
      ],
      "no-duplicate-imports": ["error", { includeExports: true }],
      "import/order": [
        "error",
        {
          groups: [
            ["external", "builtin"],
            "internal",
            ["sibling", "parent", "index"],
          ],
          "newlines-between": "always",
          pathGroups: [{ pattern: "@/*", group: "internal" }],
          pathGroupsExcludedImportTypes: ["internal"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/named": "off",
      "import/no-unresolved": "off",
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.node },
  },
]);
