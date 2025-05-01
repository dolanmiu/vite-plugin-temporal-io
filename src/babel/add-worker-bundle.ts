import { type PluginItem, transformAsync } from "@babel/core";

import { visitor } from "./visitor";

const plugin: PluginItem = {
  visitor,
};

export const runBabel = async (input: string): Promise<string> => {
  const { code } =
    (await transformAsync(input, {
      plugins: [
        [
          "@babel/plugin-syntax-typescript",
          {
            isTSX: false,
            allExtensions: true,
          },
        ],
        [plugin],
      ],
    })) ?? {};

  return code ?? input;
};
