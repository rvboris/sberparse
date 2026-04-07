#!/usr/bin/env node

import { run } from "@oclif/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import packageJson from "../package.json" with { type: "json" };
import { logger } from "./logger.js";

const currentFile = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(currentFile), "..");
const isSource = currentFile.endsWith(`${path.sep}src${path.sep}cli.ts`);
const commandsTarget = isSource ? "./src/commands/index.ts" : "./dist/commands/index.js";

const pjson = {
  ...packageJson,
  oclif: {
    ...packageJson.oclif,
    commands: {
      strategy: "single" as const,
      target: commandsTarget,
    },
  },
};

await run(process.argv.slice(2), { root, pjson }).catch((error: unknown) => {
  const hasOclif =
    typeof error === "object" &&
    error !== null &&
    "oclif" in error &&
    typeof (error as { oclif?: { exit?: number } }).oclif === "object";

  if (!hasOclif) {
    logger.error`Неожиданная ошибка: ${error}`;
  }

  process.exitCode = 1;
});
