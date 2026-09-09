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

import { parseForESLint } from "@html-eslint/parser";
import { parseHTML } from "linkedom";

import { fromDocument } from "../../packages/browser/adapter.ts";
import { parseHtml } from "../../packages/cli/adapter.ts";
import { fromProgram } from "../../packages/eslint-plugin/adapter.ts";
import { collectFiles } from "../../packages/cli/lint.ts";
import { loadRules } from "../../packages/rules/load.ts";
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

/**
 * Every adapter, and whether it can see the original source text.
 *
 * That single bit is the only legitimate reason two adapters may disagree, so
 * it is declared here rather than discovered: source-backed adapters must
 * agree with each other exactly, and a source-less one must agree with them
 * about everything except the source-dependent rules above.
 */
const ADAPTERS = [
  { name: "parse5", hasSource: true, parse: (src: string) => parseHtml(src) },
  {
    name: "html-eslint",
    hasSource: true,
    parse: (src: string) => fromProgram(parseForESLint(src, {}).ast, src),
  },
  {
    name: "dom",
    hasSource: false,
    parse: (src: string) => fromDocument(parseHTML(src).document),
  },
] as const;

type Comparable = {
  ruleId: string;
  severity: string;
  possible: boolean;
  message: string;
  replacement: string;
  url: string;
  tag: string;
};

/** The fields every adapter must agree on. */
const comparable = (finding: Finding): Comparable => ({
  ruleId: finding.ruleId,
  severity: finding.severity,
  possible: finding.possible,
  message: finding.message,
  replacement: finding.replacement,
  url: finding.url,
  tag: finding.node.tag,
});

type Run = Record<string, Finding[]>;

const results = new Map<string, Run>();
for (const file of files) {
  const source = await readFile(file, "utf8");
  const perAdapter: Run = {};
  for (const adapter of ADAPTERS) perAdapter[adapter.name] = run(rules, adapter.parse(source));
  results.set(file, perAdapter);
}

/** Findings from an adapter, in the shape the comparison cares about. */
const of = (file: string, adapter: string): Finding[] => results.get(file)?.[adapter] ?? [];

test("the suite actually covers every fixture", () => {
  assert.ok(files.length > 0, "no fixtures found");
  assert.equal(results.size, files.length);
});

test("adapters that can see the source agree exactly", () => {
  const sourced = ADAPTERS.filter((a) => a.hasSource).map((a) => a.name);
  const [reference, ...rest] = sourced;
  assert.ok(reference !== undefined, "need a source-backed adapter");
  assert.ok(rest.length > 0, "need a second source-backed adapter to compare against");

  for (const file of results.keys()) {
    const expected: Comparable[] = of(file, reference).map(comparable);
    for (const name of rest) {
      assert.deepEqual(of(file, name).map(comparable), expected, `${name} vs ${reference}: ${file}`);
    }
  }
});

test("a source-less adapter agrees about everything it can evaluate", () => {
  for (const file of results.keys()) {
    const expected: Comparable[] = of(file, "parse5")
      .filter((f) => !SOURCE_DEPENDENT.has(f.ruleId))
      .map(comparable);
    for (const adapter of ADAPTERS.filter((a) => !a.hasSource)) {
      assert.deepEqual(of(file, adapter.name).map(comparable), expected, `${adapter.name}: ${file}`);
    }
  }
});

test("source-backed adapters agree on positions too, not just findings", () => {
  for (const file of results.keys()) {
    const positions = (name: string) =>
      of(file, name).map((f) => `${f.ruleId}@${f.loc?.line}:${f.loc?.col}:${f.range?.[0]}`);
    assert.deepEqual(positions("html-eslint"), positions("parse5"), file);
  }
});

test("the source-dependent list is honest in both directions", () => {
  const divergent = new Set<string>();
  for (const perAdapter of results.values()) {
    const inDom = new Set((perAdapter["dom"] ?? []).map((f) => f.ruleId));
    for (const finding of perAdapter["parse5"] ?? []) {
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

test("the DOM adapter offers no positions, and says so rather than guessing", () => {
  const dom = of("test/fixtures/script/type-javascript-mime/invalid.html", "dom");
  assert.ok(dom.length > 0);
  for (const finding of dom) {
    assert.equal(finding.range, null);
    assert.equal(finding.loc, null);
  }
});

test("snippets differ by construction, but name the same element", () => {
  const file = "test/fixtures/meta/http-equiv-x-ua-compatible/invalid.html";
  const fromSource = of(file, "parse5")[0];
  const rebuilt = of(file, "dom")[0];
  assert.ok(fromSource && rebuilt);
  assert.equal(fromSource.node.tag, rebuilt.node.tag);
  // parse5 slices the real source; the DOM rebuilds an open tag from the port.
  assert.match(fromSource.node.snippet, /^<meta http-equiv="X-UA-Compatible"/);
  assert.match(rebuilt.node.snippet, /^<meta /);
  assert.match(rebuilt.node.snippet, /http-equiv="X-UA-Compatible"/);
});

test("every adapter steps into a <template>", () => {
  // parse5 and the DOM park template markup in a `content` fragment;
  // html-eslint keeps it inline. All three must still see the script.
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><title>t</title></head>' +
    '<body><template><script type="text/javascript"></script></template></body></html>';
  for (const adapter of ADAPTERS) {
    assert.deepEqual(
      run(rules, adapter.parse(html)).map((f) => f.ruleId),
      ["script/type-javascript-mime"],
      adapter.name,
    );
  }
});

test("<script> and <style> are elements in every adapter", () => {
  // html-eslint models them as ScriptTag/StyleTag with no `name`, so the
  // adapter has to synthesise the tag. Miss it and every script/* rule
  // silently stops existing in the ESLint plugin.
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><title>t</title>' +
    '<style>a{color:red}</style><script type="text/javascript"></script></head>' +
    "<body></body></html>";
  for (const adapter of ADAPTERS) {
    const tags = new Set<string>();
    const parsed = adapter.parse(html);
    const walkAll = (port: NonNullable<typeof parsed.root>): void => {
      tags.add(port.tag);
      for (const child of port.children()) walkAll(child);
    };
    if (parsed.root) walkAll(parsed.root);
    assert.ok(tags.has("script"), `${adapter.name} does not see <script>`);
    assert.ok(tags.has("style"), `${adapter.name} does not see <style>`);
  }
});
