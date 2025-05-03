import { bundleWorkflowCode } from "@temporalio/worker";
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WORKFLOW_BUNDLE_PATH } from "./constants";
import { bundle } from "./workflow-bundler";

interface WorkflowBundleWithSourceMap {
  code: string;
  sourceMap: string;
}

type NodeRequire = ReturnType<typeof createRequire>;

interface MockRequire {
  resolve: ReturnType<typeof vi.fn>;
  cache: Record<string, unknown>;
  extensions: Record<string, unknown>;
  main: Record<string, unknown>;
}

vi.mock("@temporalio/worker", () => ({
  bundleWorkflowCode: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn(),
}));

vi.mock("node:module", () => ({
  createRequire: vi.fn(),
}));

describe("workflow-bundler", () => {
  const mockRequire: MockRequire = {
    resolve: vi.fn(),
    cache: {},
    extensions: {},
    main: {},
  };

  const mockProcess = {
    cwd: vi.fn(),
  };

  const mockImportMetaUrl = "file:///mock/path/workflow-bundler.ts";
  const mockWorkflowsEntry = "src/workflows.ts";
  const mockResolvedPath = "/resolved/path/workflows.ts";
  const mockCode = "bundled workflow code";

  beforeEach(() => {
    // Setup mocks
    mockProcess.cwd.mockReturnValue("/path/to");
    mockRequire.resolve.mockReturnValue(mockResolvedPath);
    vi.mocked(createRequire).mockReturnValue(
      mockRequire as unknown as NodeRequire
    );

    vi.mocked(bundleWorkflowCode).mockResolvedValue({
      code: mockCode,
      sourceMap: "{}", // Using string as required by the actual type
    } as WorkflowBundleWithSourceMap);

    // Set up process.cwd globally
    global.process = { ...global.process, cwd: mockProcess.cwd };

    // Setup import.meta.url
    Object.defineProperty(import.meta, "url", {
      value: mockImportMetaUrl,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should resolve the workflow entry path correctly", async () => {
    await bundle({ workflowsEntry: mockWorkflowsEntry });

    expect(mockRequire.resolve).toHaveBeenCalledWith(
      path.join("/path/to", mockWorkflowsEntry)
    );
  });

  it("should call bundleWorkflowCode with the resolved path", async () => {
    await bundle({ workflowsEntry: mockWorkflowsEntry });

    expect(bundleWorkflowCode).toHaveBeenCalledWith({
      workflowsPath: mockResolvedPath,
    });
  });

  it("should write the bundled code to the correct path", async () => {
    await bundle({ workflowsEntry: mockWorkflowsEntry });

    expect(writeFile).toHaveBeenCalledWith(
      path.join("/path/to", WORKFLOW_BUNDLE_PATH),
      mockCode
    );
  });

  it("should handle errors from bundleWorkflowCode", async () => {
    const mockError = new Error("Bundle error");
    vi.mocked(bundleWorkflowCode).mockRejectedValueOnce(mockError);

    await expect(
      bundle({ workflowsEntry: mockWorkflowsEntry })
    ).rejects.toThrow("Bundle error");
  });

  it("should handle errors from writeFile", async () => {
    const mockError = new Error("Write error");
    vi.mocked(writeFile).mockRejectedValueOnce(mockError);

    await expect(
      bundle({ workflowsEntry: mockWorkflowsEntry })
    ).rejects.toThrow("Write error");
  });
});
