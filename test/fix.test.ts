import assert from "node:assert/strict";
import test from "node:test";

import { parseHtml } from "../packages/cli/adapter.ts";
import { type Rule, run } from "../packages/core/engine.ts";
import { type Fix, applyFixes } from "../packages/core/fix.ts";
import type { RuleMeta } from "../packages/core/vocabulary.ts";

const meta = (overrides: Partial<RuleMeta> & { ruleId: string }): RuleMeta => ({
  title: "Test rule",
  description: "A description.",
  pubDate: "2026-01-01",
  status: "avoid",
  severity: "unnecessary",
  standardsBasis: "spec",
  detectability: "yes",
  kind: "element",
  scope: "any",
  selector: null,
  match: null,
  fix: { op: "none", attr: null },
  replacement: "Delete it.",
  tags: [],
  impacts: [],
  related: [],
  ...overrides,
});

const fixesFor = (html: string, rules: Rule[]): Fix[] =>
  run(rules, parseHtml(html)).flatMap((finding) => (finding.fix === null ? [] : [finding.fix]));

const removeMeta: Rule = {
  meta: meta({ ruleId: "meta/x", selector: "meta[name]", fix: { op: "remove-element", attr: null } }),
};
const removeType: Rule = {
  meta: meta({
    ruleId: "script/t",
    selector: "script[type]",
    fix: { op: "remove-attribute", attr: "type" },
  }),
};

test("removing an element on its own line takes the line with it", () => {
  const html = '<html><head>\n    <meta name="a">\n    <title>t</title>\n</head><body></body></html>';
  const [fix] = fixesFor(html, [removeMeta]);
  assert.ok(fix);
  assert.equal(html.slice(...fix.range), '    <meta name="a">\n');
  assert.equal(applyFixes(html, [fix]).output.includes("\n\n"), false, "no blank line left behind");
});

test("removing an element sharing a line takes only the element", () => {
  const html = '<html><head><title>t</title><meta name="a"></head><body></body></html>';
  const [fix] = fixesFor(html, [removeMeta]);
  assert.ok(fix);
  assert.equal(html.slice(...fix.range), '<meta name="a">');
});

test("removing an attribute takes the whitespace before it", () => {
  const html = '<html><head><script type="text/javascript" src="a.js"></script></head><body></body></html>';
  const [fix] = fixesFor(html, [removeType]);
  assert.ok(fix);
  assert.equal(html.slice(...fix.range), ' type="text/javascript"');
  assert.match(applyFixes(html, [fix]).output, /<script src="a\.js">/);
});

test("a partial rule is never autofixed, however clear the edit would be", () => {
  const unsure: Rule = {
    meta: meta({
      ruleId: "meta/maybe",
      selector: "meta[name]",
      detectability: "partial",
      fix: { op: "remove-element", attr: null },
    }),
  };
  const html = '<html><head><meta name="a"></head><body></body></html>';
  const findings = run([unsure], parseHtml(html));
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.possible, true);
  assert.equal(findings[0]?.fix, null);
});

test("fix: none produces no fix", () => {
  const inert: Rule = { meta: meta({ ruleId: "meta/inert", selector: "meta[name]" }) };
  assert.deepEqual(fixesFor('<html><head><meta name="a"></head><body></body></html>', [inert]), []);
});

test("a remove-attribute rule whose attribute is absent produces no fix", () => {
  // The selector matched on something else, so there is nothing to delete.
  const odd: Rule = {
    meta: meta({
      ruleId: "script/odd",
      selector: "script",
      fix: { op: "remove-attribute", attr: "type" },
    }),
  };
  const html = "<html><head><script></script></head><body></body></html>";
  const findings = run([odd], parseHtml(html));
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.fix, null);
});

// --- applying ---------------------------------------------------------------

const fix = (start: number, end: number, text = ""): Fix => ({ ruleId: "t/x", range: [start, end], text });

test("fixes apply back to front, so earlier offsets stay valid", () => {
  const source = "0123456789";
  const { output, applied, skipped } = applyFixes(source, [fix(1, 3), fix(6, 8)]);
  assert.equal(output, "034589");
  assert.equal(applied.length, 2);
  assert.equal(skipped.length, 0);
});

test("input order does not matter", () => {
  const source = "0123456789";
  assert.equal(applyFixes(source, [fix(6, 8), fix(1, 3)]).output, applyFixes(source, [fix(1, 3), fix(6, 8)]).output);
});

test("overlapping fixes are skipped, not merged", () => {
  // Two rules disagreeing about the same bytes is a conflict; guessing at a
  // resolution would corrupt the file.
  const { output, applied, skipped } = applyFixes("0123456789", [fix(2, 6), fix(4, 8)]);
  assert.equal(applied.length, 1);
  assert.equal(skipped.length, 1);
  assert.equal(applied[0]?.range[0], 4, "the later fix wins, the earlier is deferred");
  assert.equal(output, "012389");
});

test("adjacent fixes both apply", () => {
  const { applied, output } = applyFixes("0123456789", [fix(2, 4), fix(4, 6)]);
  assert.equal(applied.length, 2);
  assert.equal(output, "016789");
});

test("applied and skipped come back in document order", () => {
  const { applied } = applyFixes("0123456789", [fix(6, 8), fix(0, 2), fix(3, 5)]);
  assert.deepEqual(applied.map((f) => f.range[0]), [0, 3, 6]);
});

test("replacement text is honoured, not just deletion", () => {
  assert.equal(applyFixes("<b>x</b>", [fix(0, 3, "<i>")]).output, "<i>x</b>");
});
