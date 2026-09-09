/**
 * Assemble the runnable rule set: `rules.json` plus the logic modules the
 * rules that need code point at.
 *
 * Lives here because both the CLI and the ESLint plugin need it, and it is
 * about this package's own contents. Node built-ins only, so `@deadhead/rules`
 * keeps its zero-runtime-dependency guarantee.
 *
 * The browser cannot use this at all: it has no filesystem and no module
 * loader it may reach for, so `scripts/build-bookmarklet.ts` statically inlines
 * the same rules and logic into a single IIFE instead.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import type { Rule } from "../core/engine.ts";
import type { CheckFn, MatchFn } from "../core/types.ts";
import type { RuleMeta } from "../core/vocabulary.ts";

const RULES_JSON = new URL("./rules.json", import.meta.url);
const LOGIC_DIR = new URL("./logic/", import.meta.url);

type RulesFile = { schemaVersion: number; rules: RuleMeta[] };

export class RulesNotBuiltError extends Error {}

export async function loadRules(): Promise<Rule[]> {
  let raw: string;
  try {
    raw = await readFile(RULES_JSON, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new RulesNotBuiltError(
        `${fileURLToPath(RULES_JSON)} does not exist. It is generated from content/rules — run \`pnpm build\`.`,
      );
    }
    throw err;
  }

  const parsed = JSON.parse(raw) as RulesFile;
  const rules: Rule[] = [];

  for (const meta of parsed.rules) {
    const rule: Rule = { meta };

    if (meta.match === "logic" || meta.kind === "document") {
      const module: Record<string, unknown> = await import(
        new URL(`${meta.ruleId}.ts`, LOGIC_DIR).href
      );
      const entry = meta.kind === "document" ? "check" : "match";
      const fn = module[entry];
      if (typeof fn !== "function") {
        throw new Error(
          `${meta.ruleId}: packages/rules/logic/${meta.ruleId}.ts must export ${entry}()`,
        );
      }
      if (meta.kind === "document") rule.check = fn as CheckFn;
      else rule.match = fn as MatchFn;
    }

    rules.push(rule);
  }

  return rules;
}
