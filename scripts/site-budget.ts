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
process.exit(over ? 1 : 0);
