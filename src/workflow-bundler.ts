import { bundleWorkflowCode } from "@temporalio/worker";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { WORKFLOW_BUNDLE_PATH } from "./constants";

export const bundle = async ({
  workflowsEntry,
}: {
  workflowsEntry: string;
}) => {
  const require = createRequire(import.meta.url);
  const pathName = require.resolve(path.join(process.cwd(), workflowsEntry));
  const { code } = await bundleWorkflowCode({
    // workflowsPath: require.resolve('./src/workflows'),
    workflowsPath: pathName,
  });
  const codePath = path.join(process.cwd(), WORKFLOW_BUNDLE_PATH);

  await writeFile(codePath, code);
};
