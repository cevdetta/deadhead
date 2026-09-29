#!/usr/bin/env node
/**
 * SEO gate over the built site, run by `pnpm check:site` after the byte
 * budget. Reads site/dist as files; builds nothing. Each check guards a
 * decision in .claude/plans/2026-09-29-seo.md.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const dist = process.argv[2] ?? "site/dist";
const problems: string[] = [];

/** Astro escapes <, > and " in text and " in attributes; checks read the decoded value. */
const decode = (text: string): string =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

/** The decoded `content` of `<meta name|property="key">`, or null. */
const metaContent = (html: string, attr: "name" | "property", key: string): string | null => {
  const match = new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`).exec(html);
  return match?.[1] === undefined ? null : decode(match[1]);
};

// Every page with a <head>. A file without one, like a search-console
// verification page, carries nothing to check.
const pages: { path: string; html: string }[] = [];
for (const file of (await readdir(dist, { recursive: true })).filter((f) => f.endsWith(".html")).sort()) {
  const html = await readFile(join(dist, file), "utf8");
  if (/<head[\s>]/i.test(html)) pages.push({ path: file.split("\\").join("/"), html });
}

// One <h1> per page: the page's subject, stated once (decision S3).
for (const { path, html } of pages) {
  const count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (count !== 1) problems.push(`${path}: ${count} <h1> elements, want 1`);
}

// The home page names the project the same way everywhere: no markup
// characters that previews and SEO tools strip, and a description long
// enough to say what it does (decisions S1, S2).
const home = pages.find((p) => p.path === "index.html");
if (home === undefined) {
  problems.push("index.html: missing");
} else {
  const title = decode(/<title>([^<]*)<\/title>/.exec(home.html)?.[1] ?? "");
  const description = metaContent(home.html, "name", "description") ?? "";
  if (/[<>]/.test(title)) problems.push(`index.html: title holds < or >: ${title}`);
  if (/[<>]/.test(description)) problems.push(`index.html: description holds < or >: ${description}`);
  if (description.length < 120 || description.length > 160) {
    problems.push(`index.html: description is ${description.length} characters, want 120-160`);
  }
}

for (const problem of problems) process.stdout.write(`✗ ${problem}\n`);
if (problems.length === 0) process.stdout.write(`✓ SEO checks passed on ${pages.length} pages\n`);
process.exit(problems.length > 0 ? 1 : 0);
