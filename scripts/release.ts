#!/usr/bin/env node
/**
 * Prepare a release: bump both packages in lockstep and draft the changelog
 * section from what changed under content/rules since the last tag. It prints
 * the commands; the maintainer runs them with their own signing keys.
 */

import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const MANIFESTS = ["packages/cli/package.json", "packages/eslint-plugin/package.json"];
const idOf = (path: string): string => path.replace(/^content\/rules\//, "").replace(/\.md$/, "");

export function bump(version: string, kind: "patch" | "minor" | "major"): string {
  const [major, minor, patch] = version.split(".").map(Number) as [number, number, number];
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function parseNameStatus(out: string): { added: string[]; removed: string[]; renamed: [string, string][] } {
  const added: string[] = [];
  const removed: string[] = [];
  const renamed: [string, string][] = [];
  for (const line of out.split("\n")) {
    const [status, a, b] = line.split("\t");
    if (status === undefined || a === undefined || !a.endsWith(".md")) continue;
    if (status === "A") added.push(idOf(a));
    else if (status === "D") removed.push(idOf(a));
    else if (status.startsWith("R") && b !== undefined) renamed.push([idOf(a), idOf(b)]);
  }
  return { added, removed, renamed };
}

if (import.meta.main) {
  const kind = process.argv[2];
  if (kind !== "patch" && kind !== "minor" && kind !== "major") {
    process.stderr.write("usage: node scripts/release.ts <patch|minor|major>\n");
    process.exit(2);
  }
  const current = JSON.parse(await readFile(MANIFESTS[0]!, "utf8")).version as string;
  const next = bump(current, kind);
  for (const path of MANIFESTS) {
    const pkg = JSON.parse(await readFile(path, "utf8"));
    pkg.version = next;
    await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`);
  }
  const lastTag = execFileSync("git", ["describe", "--tags", "--abbrev=0"], { encoding: "utf8" }).trim();
  const changes = parseNameStatus(execFileSync("git", ["diff", "--name-status", "-M", lastTag, "--", "content/rules"], { encoding: "utf8" }));
  const list = (title: string, items: string[]) => (items.length === 0 ? "" : `\n### ${title}\n\n${items.map((i) => `- \`${i}\``).join("\n")}\n`);
  const section = `## ${next}\n${list("Added", changes.added)}${list("Renamed", changes.renamed.map(([a, b]) => `${a}\` → \`${b}`))}${list("Removed", changes.removed)}\n`;
  const changelog = await readFile("CHANGELOG.md", "utf8");
  await writeFile("CHANGELOG.md", changelog.replace(/\n## /, `\n${section}## `));
  process.stdout.write(
    `Bumped ${current} → ${next}. Edit CHANGELOG.md, open the release PR, merge it, then from main:\n\n` +
      `  git tag -s v${next} -m "v${next}"\n` +
      `  git push origin v${next}\n`,
  );
}
