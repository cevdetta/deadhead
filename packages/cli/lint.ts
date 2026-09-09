/**
 * File discovery and per-file linting, kept out of `bin/` so the tests can
 * drive the real thing without spawning a process.
 */

import { glob, readFile, readdir, stat } from "node:fs/promises";
import { extname, join, sep } from "node:path";

import { type Rule, parseSuppressions, run } from "../core/index.ts";
import { parseHtml } from "./adapter.ts";
import type { FileResult } from "./reporters/index.ts";

const HTML = new Set([".html", ".htm"]);
const GLOB = /[*?[\]{}]/;

export class UsageError extends Error {}

const isHtml = (path: string): boolean => HTML.has(extname(path).toLowerCase());

/**
 * Never walk into these. Pointing the linter at `.` should not spend a minute
 * on `node_modules`, and a dot-directory is somebody's tooling, not their site.
 */
const isIgnored = (relative: string): boolean =>
  relative
    .split(/[\\/]/)
    .some((segment) => segment === "node_modules" || (segment.startsWith(".") && segment !== "."));

/**
 * Expand arguments into HTML files.
 *
 * Three shapes, with deliberately different rules:
 *
 * - a glob is expanded here rather than by the shell, so `check:self` behaves
 *   the same on Windows, where the shell would hand the pattern through
 *   verbatim. `fs.glob` is the platform's, so this costs no dependency.
 * - a directory is walked recursively for `.html`/`.htm`.
 * - an explicit file path is linted whatever it is called. If you named it,
 *   you meant it.
 */
export async function collectFiles(paths: string[]): Promise<string[]> {
  const files = new Set<string>();

  for (const path of paths) {
    if (GLOB.test(path)) {
      let matched = false;
      for await (const entry of glob(path)) {
        matched = true;
        if (!isHtml(entry) || isIgnored(entry)) continue;
        if ((await stat(entry)).isFile()) files.add(entry);
      }
      if (!matched) throw new UsageError(`no files matched: ${path}`);
      continue;
    }

    let info;
    try {
      info = await stat(path);
    } catch {
      throw new UsageError(`no such file or directory: ${path}`);
    }

    if (info.isDirectory()) {
      for (const entry of await readdir(path, { recursive: true })) {
        if (!isHtml(entry) || isIgnored(entry)) continue;
        const full = join(path, entry);
        if ((await stat(full)).isFile()) files.add(full);
      }
      continue;
    }
    files.add(path);
  }

  // Sorted so output is identical run to run, and stable across platforms.
  return [...files].sort((a, b) => a.split(sep).join("/").localeCompare(b.split(sep).join("/")));
}

export async function lintFile(
  file: string,
  rules: Rule[],
  options: { skipTemplates?: boolean } = {},
): Promise<FileResult> {
  const source = await readFile(file, "utf8");
  const parsed = parseHtml(source);
  const findings = run(rules, parsed, {
    // Suppression comments are read from the text, not the tree: the port has
    // no comment accessor, and only the source-backed adapters can offer this.
    suppressions: parseSuppressions(source),
    ...(options.skipTemplates !== undefined ? { skipTemplates: options.skipTemplates } : {}),
  });
  return { file, findings };
}

export async function lintFiles(
  files: string[],
  rules: Rule[],
  options: { skipTemplates?: boolean } = {},
): Promise<FileResult[]> {
  const results: FileResult[] = [];
  for (const file of files) results.push(await lintFile(file, rules, options));
  return results;
}
