/**
 * A lint worker: receives a slice of files and the run's rule settings, lints
 * them with the same code the serial path uses, and posts the results back.
 * Rules load once per worker, from the static registry.
 */

import { parentPort } from "node:worker_threads";

import { RULES } from "../rules/registry.gen.ts";
import { applySettings, type RuleSetting } from "./config.ts";
import { type LintOptions, lintFiles } from "./lint.ts";

parentPort?.on("message", async (message: { files: string[]; settings: Record<string, RuleSetting>; options: LintOptions }) => {
  const rules = applySettings(RULES, message.settings);
  const { results } = await lintFiles(message.files, rules, message.options);
  parentPort?.postMessage(results);
});
