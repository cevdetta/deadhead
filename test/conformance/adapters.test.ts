/**
 * Every fixture, through every adapter, asserting they agree.
 *
 * This — not code sharing — is what actually stops the three runtimes drifting
 * apart. Sharing a matcher only guarantees the matcher agrees; this checks
 * that the trees the adapters build agree too, which is where the interesting
 * bugs live (a `<template>`'s content fragment, an implied `<head>`, an
 * attribute name's case).
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseHTML } from "linkedom";

import { fromDocument } from "../../packages/browser/adapter.ts";
import { parseHtml } from "../../packages/cli/adapter.ts";
import { collectFiles } from "../../packages/cli/lint.ts";
import { loadRules } from "../../packages/cli/load.ts";
import { type Rule, run } from "../../packages/core/index.ts";
import type { Finding } from "../../packages/core/types.ts";

/**
 * Rules that cannot be evaluated in a live DOM, because their verdict depends
 * on the original source text rather than on the tree.
 *
 * This is a real asymmetry, not drift: `head/charset-position` asks where a
 * declaration sits in the byte stream, and a rendered document has no byte
 * stream. Its own `## Detectability` section says so.
 *
 * The list is asserted in both directions below, so it cannot rot: a rule
 * listed here must actually diverge, and a rule not listed here must actually
 * agree.
 */
const SOURCE_DEPENDENT = new Set(["head/charset-position"]);

const rules: Rule[] = await loadRules();
const files = await collectFiles(["test/fixtures"]);

/** The fields both adapters must agree on. */
const comparable = (finding: Finding) => ({
  ruleId: finding.ruleId,
  severity: finding.severity,
  possible: finding.possible,
  message: finding.message,
  replacement: finding.replacement,
  url: finding.url,
  tag: finding.node.tag,
});

type Run = { parse5: Finding[]; dom: Finding[] };

const both = async (file: string): Promise<Run> => {
  const source = await readFile(file, "utf8");
  const { document } = parseHTML(source);
  return { parse5: run(rules, parseHtml(source)), dom: run(rules, fromDocument(document)) };
};

const results = new Map<string, Run>();
for (const file of files) results.set(file, await both(file));

test("the suite actually covers every fixture", () => {
  assert.ok(files.length > 0, "no fixtures found");
  assert.equal(results.size, files.length);
});

test("both adapters report the same findings, in the same order", async () => {
  for (const [file, { parse5, dom }] of results) {
    const expected = parse5.filter((f) => !SOURCE_DEPENDENT.has(f.ruleId)).map(comparable);
    assert.deepEqual(dom.map(comparable), expected, file);
  }
});

test("the source-dependent list is honest in both directions", () => {
  const divergent = new Set<string>();
  for (const { parse5, dom } of results.values()) {
    const inDom = new Set(dom.map((f) => f.ruleId));
    for (const finding of parse5) {
      if (!inDom.has(finding.ruleId)) divergent.add(finding.ruleId);
    }
  }

  // Anything that diverges must be declared. An undeclared divergence is the
  // drift this suite exists to catch.
  for (const ruleId of divergent) {
    assert.ok(
      SOURCE_DEPENDENT.has(ruleId),
      `${ruleId} differs between adapters but is not declared source-dependent`,
    );
  }

  // And a declaration that no longer describes reality is equally wrong:
  // whoever made the rule work in a DOM should delete the entry.
  for (const ruleId of SOURCE_DEPENDENT) {
    assert.ok(
      divergent.has(ruleId),
      `${ruleId} is declared source-dependent but no longer diverges; remove it`,
    );
  }
});

test("the DOM adapter offers no positions, and says so rather than guessing", async () => {
  const { dom } = results.get("test/fixtures/script/type-javascript-mime/invalid.html") ?? {
    dom: [],
  };
  assert.ok(dom.length > 0);
  for (const finding of dom) {
    assert.equal(finding.range, null);
    assert.equal(finding.loc, null);
  }
});

test("snippets differ by construction, but name the same element", async () => {
  const file = "test/fixtures/meta/http-equiv-x-ua-compatible/invalid.html";
  const { parse5, dom } = results.get(file) ?? { parse5: [], dom: [] };
  const fromSource = parse5[0];
  const rebuilt = dom[0];
  assert.ok(fromSource && rebuilt);
  assert.equal(fromSource.node.tag, rebuilt.node.tag);
  // parse5 slices the real source; the DOM rebuilds an open tag from the port.
  assert.match(fromSource.node.snippet, /^<meta http-equiv="X-UA-Compatible"/);
  assert.match(rebuilt.node.snippet, /^<meta /);
  assert.match(rebuilt.node.snippet, /http-equiv="X-UA-Compatible"/);
});

test("both adapters step into a <template>'s content fragment", async () => {
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><title>t</title></head>' +
    '<body><template><script type="text/javascript"></script></template></body></html>';
  const { document } = parseHTML(html);
  const viaParse5 = run(rules, parseHtml(html)).map((f) => f.ruleId);
  const viaDom = run(rules, fromDocument(document)).map((f) => f.ruleId);
  assert.deepEqual(viaParse5, ["script/type-javascript-mime"]);
  assert.deepEqual(viaDom, viaParse5);
});
