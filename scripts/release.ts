#!/usr/bin/env node
/**
 * Prepare a release: bump both packages in lockstep and draft the changelog
 * section. Rules added, renamed and removed come from the content/rules diff
 * since the last tag, which no commit message can get wrong; everything else
 * comes from the squash-merged Conventional Commit subjects, grouped by what
 * they change for users. It prints the tag commands; the maintainer runs them
 * with their own signing keys.
 */

import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

const REPO = "https://github.com/cevdetta/deadhead";
const MANIFESTS = ["packages/cli/package.json", "packages/eslint-plugin/package.json"];
const idOf = (path: string): string => path.replace(/^content\/rules\//, "").replace(/\.md$/, "");

export type RuleChanges = { added: string[]; removed: string[]; renamed: [string, string][] };
export type Entry = { text: string; pr: string | null };
export type Groups = { rules: Entry[]; ruleFixes: Entry[]; features: Entry[]; fixes: Entry[]; performance: Entry[] };

export function bump(version: string, kind: "patch" | "minor" | "major"): string {
  const [major, minor, patch] = version.split(".").map(Number) as [number, number, number];
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function parseNameStatus(out: string): RuleChanges {
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

const SUBJECT = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<text>.+?)(?: \(#(?<pr>\d+)\))?$/;
/** Changes to the docs site, the build and the repository itself do not reach either package. */
const SKIPPED_TYPES = new Set(["site", "chore", "ci", "docs", "build", "test", "refactor", "style", "branch"]);

/** Conventional Commit subjects (newest first, as `git log` prints them) grouped for the changelog. */
export function groupCommits(subjects: string[]): Groups {
  const groups: Groups = { rules: [], ruleFixes: [], features: [], fixes: [], performance: [] };
  for (const subject of subjects) {
    const m = SUBJECT.exec(subject)?.groups;
    if (m === undefined || SKIPPED_TYPES.has(m["type"]!) || m["scope"] === "site") continue;
    const entry: Entry = { text: `${m["breaking"] ? "**Breaking:** " : ""}${m["text"]}`, pr: m["pr"] ?? null };
    const type = m["type"];
    if (type === "feat" && m["scope"] === "rule") groups.rules.push(entry);
    else if (type === "fix" && m["scope"] === "rule") groups.ruleFixes.push(entry);
    else if (type === "feat") groups.features.push(entry);
    else if (type === "fix") groups.fixes.push(entry);
    else if (type === "perf") groups.performance.push(entry);
  }
  return groups;
}

const link = (pr: string | null): string => (pr === null ? "" : ` ([#${pr}](${REPO}/pull/${pr}))`);
const list = (title: string, lines: string[]): string =>
  lines.length === 0 ? "" : `### ${title}\n\n${lines.map((line) => `- ${line}`).join("\n")}\n\n`;

/** One changelog section: rule changes first (from the diff), then the commit groups. */
export function renderSection(version: string, date: string, previousTag: string, groups: Groups, rules: RuleChanges): string {
  // New rules come from the diff; a matching `feat(rule): <id>` commit lends its PR link.
  const prFor = new Map(groups.rules.map((entry) => [entry.text.split(" ")[0], entry.pr]));
  return (
    `## ${version} - ${date}\n\n` +
    list("New rules", rules.added.map((id) => `\`${id}\`${link(prFor.get(id) ?? null)}`)) +
    list("Renamed", rules.renamed.map(([from, to]) => `\`${from}\` → \`${to}\``)) +
    list("Removed", rules.removed.map((id) => `\`${id}\``)) +
    list("Rule fixes", groups.ruleFixes.map((e) => `${e.text}${link(e.pr)}`)) +
    list("Features", groups.features.map((e) => `${e.text}${link(e.pr)}`)) +
    list("Fixes", groups.fixes.map((e) => `${e.text}${link(e.pr)}`)) +
    list("Performance", groups.performance.map((e) => `${e.text}${link(e.pr)}`)) +
    `[Full diff](${REPO}/compare/${previousTag}...v${version})\n`
  );
}

if (import.meta.main) {
  const kind = process.argv[2];
  if (kind !== "patch" && kind !== "minor" && kind !== "major") {
    process.stderr.write("usage: node scripts/release.ts <patch|minor|major>\n");
    process.exit(2);
  }
  const git = (args: string[]) => execFileSync("git", args, { encoding: "utf8" });
  let lastTag: string;
  try {
    lastTag = git(["describe", "--tags", "--abbrev=0", "--match", "v*"]).trim();
  } catch {
    process.stderr.write("no v* tag yet: 0.1.0 is tagged by hand (RELEASING.md, first release)\n");
    process.exit(2);
  }
  const current = JSON.parse(await readFile(MANIFESTS[0]!, "utf8")).version as string;
  const next = bump(current, kind);
  for (const path of MANIFESTS) {
    const pkg = JSON.parse(await readFile(path, "utf8"));
    pkg.version = next;
    await writeFile(path, `${JSON.stringify(pkg, null, 2)}\n`);
  }
  const rules = parseNameStatus(git(["diff", "--name-status", "-M", lastTag, "--", "content/rules"]));
  const subjects = git(["log", "--no-merges", "--format=%s", `${lastTag}..HEAD`]).split("\n").filter(Boolean);
  const section = renderSection(next, new Date().toISOString().slice(0, 10), lastTag, groupCommits(subjects), rules);
  const changelog = await readFile("CHANGELOG.md", "utf8");
  await writeFile("CHANGELOG.md", changelog.replace(/\n## /, `\n${section}\n## `));
  process.stdout.write(
    `Bumped ${current} → ${next} and drafted its CHANGELOG.md section. Edit it, open the release PR, merge it, then from main:\n\n` +
      `  git tag -s v${next} -m "v${next}"\n` +
      `  git push origin v${next}\n`,
  );
}
