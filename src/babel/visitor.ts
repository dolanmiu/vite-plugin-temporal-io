import { NodePath, TraverseOptions } from "@babel/traverse";
import { Program } from "@babel/types";

import { WORKFLOW_BUNDLE_PATH } from "../constants";

export const visitor: TraverseOptions = {
  ImportDeclaration(path) {
    if (path.node.source.value === "@temporalio/worker") {
      const { specifiers } = path.node;

      if (specifiers.length > 0) {
        if (
          specifiers[0].type === "ImportSpecifier" &&
          specifiers[0].imported.type === "Identifier" &&
          specifiers[0].local.type === "Identifier"
        ) {
          const name = specifiers[0].imported.name;
          if (name === "Worker") {
            const newName = specifiers[0].local.name;
            // Get file node from path
            const root = path.findParent((p) =>
              p.isProgram()
            )! as NodePath<Program>;

            root.traverse({
              CallExpression(callPath) {
                const callee = callPath.node.callee;
                if (callee.type === "MemberExpression") {
                  if (
                    callee.object.type === "Identifier" &&
                    callee.property.type === "Identifier" &&
                    callee.object.name === newName &&
                    callee.property.name === "create"
                  ) {
                    const [arg] = callPath.node.arguments;
                    if (arg.type === "ObjectExpression") {
                      arg.properties.push({
                        type: "ObjectProperty",
                        computed: false,
                        shorthand: false,
                        key: {
                          type: "Identifier",
                          name: "workflowBundle",
                        },
                        value: {
                          type: "ObjectExpression",
                          properties: [
                            {
                              type: "ObjectProperty",
                              key: {
                                type: "Identifier",
                                name: "code",
                              },
                              value: {
                                type: "CallExpression",
                                callee: {
                                  type: "MemberExpression",
                                  object: {
                                    type: "Identifier",
                                    name: "fs",
                                  },
                                  property: {
                                    type: "Identifier",
                                    name: "readFileSync",
                                  },
                                  computed: false,
                                },
                                arguments: [
                                  {
                                    type: "StringLiteral",
                                    value: WORKFLOW_BUNDLE_PATH,
                                  },
                                  {
                                    type: "StringLiteral",
                                    value: "utf-8",
                                  },
                                ],
                              },
                              computed: false,
                              shorthand: false,
                            },
                          ],
                        },
                      });

                      const lastImport = root
                        .get("body")
                        .filter((p) => p.isImportDeclaration())
                        .pop();
                      if (lastImport)
                        lastImport.insertAfter({
                          type: "ImportDeclaration",
                          specifiers: [
                            {
                              type: "ImportNamespaceSpecifier",
                              local: {
                                type: "Identifier",
                                name: "fs",
                              },
                            },
                          ],
                          source: {
                            type: "StringLiteral",
                            value: "node:fs",
                          },
                        });
                    }
                  }
                }
              },
            });
          }
        }
      }
    }
  },
};
