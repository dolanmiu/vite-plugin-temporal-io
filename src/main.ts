import { readFileSync } from "node:fs";
import path from "node:path";
import { type Plugin, PluginOption } from "vite";
import createExternal from "vite-plugin-external";

import { runBabel } from "./babel/add-worker-bundle";
import { bundle } from "./workflow-bundler";

const pkg = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "./package.json"), "utf-8")
);

const pluginWrapper = ({
  include = "src",
  workflowsEntry,
}: {
  include?: string;
  workflowsEntry: string;
}): PluginOption => {
  const plugin: Plugin = {
    name: "temporal-io",
    config: (config) => {
      return {
        ...config,
        build: {
          ...config?.build,
          minify: false,
        },
      };
    },

    async transform(code, id) {
      // Normalize paths to handle cross-platform path separators
      const normalizedId = id.split(path.sep).join("/");
      const normalizedIncludePath = path
        .normalize(path.resolve(process.cwd(), include))
        .split(path.sep)
        .join("/");

      // Check if the file is within the include directory using normalized paths
      if (!normalizedId.includes(normalizedIncludePath)) {
        return null;
      }

      return {
        code: await runBabel(code),
        map: null,
      };
    },

    async closeBundle() {
      await bundle({
        workflowsEntry: path.join(include, workflowsEntry),
      });
    },
  };

  return [
    createExternal({
      nodeBuiltins: true,
      externalizeDeps: [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
      ],
    }),
    plugin,
  ];
};

export default pluginWrapper;
