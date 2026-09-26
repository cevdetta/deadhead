/**
 * An outline from deadhead.css is a finding, so the stylesheet must agree with
 * the engine. Every fixture runs through both: the engine through the DOM
 * adapter, the stylesheet by matching each `::after` label's selector list
 * with querySelector, the way a browser applies it.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseHTML } from "linkedom";

import { fromDocument } from "../../packages/browser/adapter.ts";
import { collectFiles } from "../../packages/cli/lint.ts";
import { run } from "../../packages/core/index.ts";
import { loadRules } from "../../packages/rules/load.ts";
import { renderCss } from "../../scripts/build-css.ts";

const rules = await loadRules();
const stylesheet = renderCss(rules);

/** Each label's rule id and the selector list it draws on. */
const labels = [...stylesheet.matchAll(/([^{}]+)\{\s*content:\s*"([^"]+)"/g)].map(([, selectors, label]) => ({
  ruleId: label!.split(" · ")[1]!.split(" ")[0]!,
  selector: selectors!.split(",\n").map((part) => part.trim().replace(/::after$/, "")).join(", "),
}));

const fixtures = await Promise.all(
  (await collectFiles(["test/fixtures"])).map(async (file) => {
    const { document } = parseHTML(await readFile(file, "utf8"));
    return {
      file,
      found: new Set(run(rules, fromDocument(document)).map((f) => f.ruleId)),
      outlined: new Set(labels.filter((l) => document.querySelector(l.selector) !== null).map((l) => l.ruleId)),
    };
  }),
);

test("the stylesheet carries labels to check", () => {
  assert.ok(labels.length > 100, `${labels.length} labels`);
  assert.ok(fixtures.length > 100, `${fixtures.length} fixtures`);
});

test("deadhead.css outlines nothing the engine does not report", () => {
  const extra: Record<string, number> = {};
  for (const { outlined, found } of fixtures) {
    for (const ruleId of outlined) if (!found.has(ruleId)) extra[ruleId] = (extra[ruleId] ?? 0) + 1;
  }
  assert.deepEqual(extra, {}, "rule id: fixtures where the stylesheet outlines a finding the engine does not report");
});
