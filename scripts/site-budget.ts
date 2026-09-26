#!/usr/bin/env node
/**
 * The site is held to a byte budget, like its <head> is held to the rules.
 * Numbers are gzip -9 of the built HTML, and raw bytes of the CSS. Each
 * improvement lowers site/budget.json, so a regression fails check:site.
 */

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const dist = process.argv[2] ?? "site/dist";
const budget: Record<string, number> = JSON.parse(await readFile("site/budget.json", "utf8"));
const gz = async (file: string) => gzipSync(await readFile(join(dist, file)), { level: 9 }).length;

const problems: string[] = [];

// dist/_headers: Cloudflare Pages reads a path pattern at column 0 followed
// by indented `Name: value` lines. Only the hashed /_astro/* assets may be
// immutable; /bookmarklet.js and /deadhead.css get new bytes under the same
// name every release.
const headersText = await readFile(join(dist, "_headers"), "utf8").catch(() => null);
if (headersText === null) {
  problems.push("dist/_headers is missing");
} else {
  const blocks: { path: string; lines: string[] }[] = [];
  for (const line of headersText.split("\n")) {
    if (line.trim() === "") continue;
    if (/^\s/.test(line)) blocks.at(-1)?.lines.push(line.trim());
    else blocks.push({ path: line.trim(), lines: [] });
  }
  const immutable = "Cache-Control: public, max-age=31536000, immutable";
  const astroBlock = blocks.find((b) => b.path === "/_astro/*");
  if (!astroBlock || !astroBlock.lines.includes(immutable)) {
    problems.push(`dist/_headers: /_astro/* is missing "${immutable}"`);
  }
  for (const block of blocks) {
    if (block.path === "/_astro/*") continue;
    if (block.lines.some((line) => /immutable/i.test(line))) {
      problems.push(`dist/_headers: ${block.path} must not carry immutable`);
    }
  }
}

// dist/404.html: not indexed, so it asserts no canonical identity.
const notFoundHtml = await readFile(join(dist, "404.html"), "utf8").catch(() => null);
if (notFoundHtml === null) {
  problems.push("dist/404.html is missing");
} else {
  const metaTags = notFoundHtml.match(/<meta\b[^>]*>/gi) ?? [];
  const hasNoindex = metaTags.some(
    (tag) => /\bname="robots"/i.test(tag) && /\bcontent="[^"]*\bnoindex\b[^"]*"/i.test(tag),
  );
  const hasOgUrl = metaTags.some((tag) => /\bproperty="og:url"/i.test(tag));
  const hasCanonical = /<link\b[^>]*\brel="canonical"/i.test(notFoundHtml);
  if (hasCanonical) problems.push("dist/404.html: canonical link present, noindex pages must omit it");
  if (hasOgUrl) problems.push("dist/404.html: og:url meta present, noindex pages must omit it");
  if (!hasNoindex) problems.push('dist/404.html: missing <meta name="robots" content="noindex">');
}

const ruleFiles = (await readdir(join(dist, "rules"), { recursive: true })).filter((f) => f.endsWith(".html"));
const ruleSizes = await Promise.all(ruleFiles.map((f) => gz(join("rules", f))));
const css = (await readdir(join(dist, "_astro"))).filter((f) => f.endsWith(".css"));
const cssRaw = (await Promise.all(css.map((f) => readFile(join(dist, "_astro", f))))).reduce((n, b) => n + b.length, 0);

const measured: Record<string, number> = {
  homeGzip: await gz("index.html"),
  rulesIndexGzip: await gz("rules.html"),
  rulePageAvgGzip: Math.round(ruleSizes.reduce((a, b) => a + b, 0) / ruleSizes.length),
  cssRaw,
};

let over = false;
for (const [key, value] of Object.entries(measured)) {
  const limit = budget[key] ?? Infinity;
  const flag = value > limit ? "OVER" : "ok";
  if (value > limit) over = true;
  process.stdout.write(`${key.padEnd(16)} ${String(value).padStart(7)} / ${String(limit).padStart(7)}  ${flag}\n`);
}

for (const problem of problems) {
  process.stdout.write(`✗ ${problem}\n`);
}

process.exit(over || problems.length > 0 ? 1 : 0);
