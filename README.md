# vite-plugin-temporal-io

<p align="center">
  <img src="./.github/logo.webp" alt="vite-plugin-temporal-io" width="200" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/vite-plugin-temporal-io"><img src="https://img.shields.io/npm/v/vite-plugin-temporal-io.svg" alt="npm version"></a>
  <a href="https://github.com/dolanmiu/vite-plugin-temporal-io/actions"><img src="https://github.com/dolanmiu/vite-plugin-temporal-io/workflows/CI/badge.svg" alt="Build Status"></a>
  <a href="https://github.com/dolanmiu/vite-plugin-temporal-io/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dolanmiu/vite-plugin-temporal-io" alt="License"></a>
  <a href="https://www.npmjs.com/package/vite-plugin-temporal-io"><img src="https://img.shields.io/npm/dt/vite-plugin-temporal-io.svg" alt="Downloads"></a>
</p>

## Overview

`vite-plugin-temporal-io` is a `Vite` plugin for seamless integration of `Temporal.io` workflows in your Vite based TypeScript projects. This plugin automatically handles workflow bundling and code transformations needed for `Temporal.io` to function properly within the Vite ecosystem.

Migrate away from the Webpack approach and embrace the modern Vite way!

## Features

- 🚀 Seamless integration with Temporal.io and Vite
- 📦 Automatic workflow bundling
- 🔄 Code transformations for Temporal.io compatibility
- 🧩 Minimal configuration required
- 📝 TypeScript support out of the box

## Installation

```bash
# Using npm
npm install vite-plugin-temporal-io -D

# Using yarn
yarn add vite-plugin-temporal-io -D

# Using pnpm
pnpm add vite-plugin-temporal-io -D
```

## Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import temporalPlugin from "vite-plugin-temporal-io";

export default defineConfig({
  plugins: [
    temporalPlugin({
      // Options
      include: "src", // Optional Value. Default is "src"
      workflowsEntry: "./workflows.ts", // Required Value. Path to your workflows entry file
    }),
  ],
});
```

## Configuration Options

| Option           | Type     | Default | Description                                                                                                           |
| ---------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `include`        | `string` | `"src"` | Directory where your source code is in.                                                                               |
| `workflowsEntry` | `string` | -       | **Required**. Path to the entry file that exports your Temporal.io workflows. It is relative to the `include` folder. |

## Workflow Organization

The plugin requires you to specify a `workflowsEntry` path pointing to the file that exports all your Temporal.io workflows. This file will be used as the entry point for bundling your workflows.

## Requirements

- Vite
- `@temporalio/worker` as a `peer dependency`

## Example Usage

1. Define your workflows in `src/workflows.ts`:

```typescript
export async function myWorkflow(input: string): Promise<string> {
  // Your workflow logic here
  return `Processed: ${input}`;
}
```

1. Create a worker in your application. No need to specify the workflow path or bundle, as it will be automatically injected by the plugin:

```typescript
import { Worker } from "@temporalio/worker";

import * as activities from "./activities";
import { namespace, taskQueue } from "./shared";

async function run() {
  const worker = await Worker.create({
    activities,
    namespace,
    taskQueue,
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Dolan Miu](https://github.com/dolanmiu)
