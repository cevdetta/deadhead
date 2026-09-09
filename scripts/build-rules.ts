#!/usr/bin/env node
/**
 * Compile `content/rules/**\/*.md` into `packages/rules/rules.json`.
 *
 * The markdown is the source of truth; this is the only thing that turns it
 * into something a runtime can load. The output is gitignored on purpose —
 * a checked-in generated file is a second source of truth waiting to drift.
 *
 * Prose is deliberately *not* emitted. Every finding links to
 * https://deadhead.dev/rules/<ruleId> for the explanation, and the bookmarklet
 * inlines this file into a single IIFE, so anything in here is bytes in a
 * URL bar.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { styleText } from "node:util";

import { META_KEYS, type RuleMeta } from "./schema.ts";
import { ROOT, loadRules, printDiagnostics, rel } from "./rules-source.ts";

const OUT = resolve(ROOT, "packages/rules/rules.json");

/** Fixed key order, so a one-field change is a one-line diff when inspected. */
function ordered(meta: RuleMeta): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of META_KEYS) out[key] = meta[key];
  return out;
}

const { rules, diagnostics } = await loadRules();

if (diagnostics.length > 0) {
  printDiagnostics(diagnostics);
  process.stderr.write(
    `\n${styleText("red", `${diagnostics.length} problem(s)`)}; refusing to build rules.json\n`,
  );
  process.exit(1);
}

// Sorted by ruleId (loadRules guarantees it) and newline-terminated: the output
// is reproducible, so a rebuild that changes nothing produces zero bytes of diff.
const payload = {
  schemaVersion: 1,
  rules: rules.map((rule) => ordered(rule.meta)),
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

process.stdout.write(
  `${styleText("green", "✓")} ${rules.length} rule(s) → ${rel(OUT)}\n`,
);
