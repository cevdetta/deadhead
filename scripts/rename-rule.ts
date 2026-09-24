#!/usr/bin/env node
/**
 * Rename a rule: move its markdown, logic module and fixtures, and rewrite
 * the id everywhere it is referenced. Ids are permanent once published
 * (invariant 4); this exists for taxonomy v2, before the first publish.
 */

import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

import { RULE_ID } from "../packages/core/vocabulary.ts";

/** Where a ruleId can appear as text. Generated files and node_modules are never touched. */
const TEXT_ROOTS = ["content", "packages", "scripts", "test", "site/src", "README.md", "CONTRIBUTING.md"];
const TEXT_EXT = /\.(md|ts|astro|html|json|yml|yaml)$/;

async function exists(path: string): Promise<boolean> {
  return stat(path).then(() => true, () => false);
}

async function* textFiles(root: string, entry: string): AsyncGenerator<string> {
  const full = join(root, entry);
  if (!(await exists(full))) return;
  if ((await stat(full)).isFile()) {
    yield full;
    return;
  }
  for (const rel of await readdir(full, { recursive: true })) {
    const path = join(full, rel);
    if (rel.includes("node_modules") || rel.endsWith("rules.json") || rel.endsWith("bookmarklet.js")) continue;
    if (TEXT_EXT.test(rel) && (await stat(path)).isFile()) yield path;
  }
}

export async function renameRule(root: string, from: string, to: string): Promise<string[]> {
  if (!RULE_ID.test(from) || !RULE_ID.test(to)) throw new Error(`not a ruleId: ${from} or ${to}`);
  const changed: string[] = [];
  const move = async (a: string, b: string): Promise<void> => {
    if (!(await exists(join(root, a)))) return;
    await mkdir(dirname(join(root, b)), { recursive: true });
    await rename(join(root, a), join(root, b));
    changed.push(b);
  };
  await move(`content/rules/${from}.md`, `content/rules/${to}.md`);
  await move(`packages/rules/logic/${from}.ts`, `packages/rules/logic/${to}.ts`);
  await move(`test/fixtures/${from}`, `test/fixtures/${to}`);

  // Whole-id matches only: `attr/foo` must not rewrite `attr/foo-bar`.
  // R4: drop `/` from lookbehind so references like `packages/rules/logic/attr/foo-obsolete.ts`,
  // `test/fixtures/attr/foo-obsolete/` and `/rules/attr/foo-obsolete` get rewritten too.
  const pattern = new RegExp(`(?<![\\w-])${from.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(?![\\w-])`, "g");
  for (const entry of TEXT_ROOTS) {
    for await (const path of textFiles(root, entry)) {
      const text = await readFile(path, "utf8");
      const next = text.replace(pattern, to);
      if (next !== text) {
        await writeFile(path, next, "utf8");
        changed.push(path.slice(root.length + 1));
      }
    }
  }

  return changed;
}

if (import.meta.main) {
  const { positionals } = parseArgs({ allowPositionals: true });
  const [from, to] = positionals;
  if (from === undefined || to === undefined) {
    process.stderr.write("usage: node scripts/rename-rule.ts <from> <to>\n");
    process.exit(2);
  }
  const root = process.cwd();
  // git mv first so history follows the files; then rewrite references.
  for (const [a, b] of [[`content/rules/${from}.md`, `content/rules/${to}.md`], [`packages/rules/logic/${from}.ts`, `packages/rules/logic/${to}.ts`], [`test/fixtures/${from}`, `test/fixtures/${to}`]] as const) {
    if (await exists(join(root, a))) {
      await mkdir(dirname(join(root, b)), { recursive: true });
      execFileSync("git", ["mv", a, b], { stdio: "inherit" });
    }
  }
  const changed = await renameRule(root, from, to);
  process.stdout.write(`${from} → ${to}: ${changed.length} file(s)\n`);
}
