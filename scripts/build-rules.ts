#!/usr/bin/env node
/**
 * Compile `content/rules/**\/*.md` into `packages/rules/rules.json`.
 *
 * The markdown is the source of truth; this is the only thing that turns it
 * into something a runtime can load. The output is gitignored on purpose —
 * a checked-in generated file is a second source of truth waiting to drift.
 *
 * Prose is deliberately *not* emitted. Every finding links to
 * https://deadhead.cevdet.ch/rules/<ruleId> for the explanation, and the bookmarklet
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

/**
 * The compiled rules.json text. Pure: no I/O beyond reading the markdown
 * source, and no write — `import.meta.main` below owns the file write so
 * importing this module never rewrites the shared, gitignored output.
 */
export async function buildRulesJson(): Promise<string> {
  const { rules, diagnostics } = await loadRules();
  if (diagnostics.length > 0) {
    printDiagnostics(diagnostics);
    throw new Error(`${diagnostics.length} problem(s); refusing to build rules.json`);
  }
  // Sorted by ruleId (loadRules guarantees it) and newline-terminated: the
  // output is reproducible, so a rebuild that changes nothing produces zero
  // bytes of diff.
  return `${JSON.stringify({ schemaVersion: 1, rules: rules.map((rule) => ordered(rule.meta)) }, null, 2)}\n`;
}

if (import.meta.main) {
  let json: string;
  try {
    json = await buildRulesJson();
  } catch (err) {
    process.stderr.write(`\n${styleText("red", (err as Error).message)}\n`);
    process.exit(1);
  }
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, json, "utf8");
  const count = (JSON.parse(json) as { rules: unknown[] }).rules.length;
  process.stdout.write(`${styleText("green", "✓")} ${count} rule(s) → ${rel(OUT)}\n`);
}
