import { resolve } from "path";
import type { UserConfig } from "vite";
import dts from "vite-plugin-dts";
import createExternal from "vite-plugin-external";
import tsConfigPaths from "vite-tsconfig-paths";
import { configDefaults } from "vitest/config";

import pkg from "./package.json";

export default {
  plugins: [
    dts({
      include: ["src"],
      rollupTypes: true,
    }),
    tsConfigPaths(),
    createExternal({
      nodeBuiltins: true,
      externalizeDeps: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies),
        ...Object.keys(pkg.peerDependencies),
      ],
    }),
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: resolve("src", "main.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => {
        switch (format) {
          case "es":
            return `${format}/index.mjs`;
          case "cjs":
            return `${format}/index.cjs`;
          default:
            return "index.js";
        }
      },
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
      exclude: [
        ...configDefaults.exclude,
        "**/dist/**",
        "**/docs/**",
        "**/src/**/index.ts",
        "**/src/**/types.ts",
        "**/*.spec.ts",
      ],
    },
    include: ["**/src/**/*.spec.ts", "**/packages/**/*.spec.ts"],
    exclude: [...configDefaults.exclude, "**/dist/**", "**/docs/**"],
  },
} satisfies UserConfig;
