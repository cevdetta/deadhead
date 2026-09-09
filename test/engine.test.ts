import assert from "node:assert/strict";
import test from "node:test";

import { type Rule, run } from "../packages/core/engine.ts";
import { parseSuppressions } from "../packages/core/suppressions.ts";
import type { Finding, RuleMeta } from "../packages/core/index.ts";
import { parseHtml } from "../packages/cli/adapter.ts";

/**
 * The engine is exercised through the real parse5 adapter rather than a hand
 * built tree: a stub that agrees with the engine but not with a parser proves
 * nothing, and this is the path the CLI actually takes.
 */
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
  fix: { op: "none", attr: null, token: null },
  replacement: "Delete it.",
  tags: [],
  impacts: [],
  related: [],
  ...overrides,
});

const lint = (html: string, rules: Rule[], suppress = false): Finding[] =>
  run(rules, parseHtml(html), suppress ? { suppressions: parseSuppressions(html) } : {});

const doc = (head: string, body = ""): string =>
  `<!doctype html>\n<html lang="en">\n<head>\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;

const ids = (findings: Finding[]): string[] => findings.map((f) => f.ruleId);

test("a selector-only rule reports every match", () => {
  const rule: Rule = { meta: meta({ ruleId: "meta/x", selector: "meta[name]" }) };
  const findings = lint(doc('<meta name="a">\n<meta name="b">\n<meta charset="utf-8">'), [rule]);
  assert.equal(findings.length, 2);
  assert.deepEqual(ids(findings), ["meta/x", "meta/x"]);
});

test("scope confines a rule to one half of the document", () => {
  const html = doc('<script src="/h.js"></script>', '<script src="/b.js"></script>');
  const rules = (scope: RuleMeta["scope"]): Rule[] => [
    { meta: meta({ ruleId: "script/s", selector: "script", scope }) },
  ];
  assert.equal(lint(html, rules("head")).length, 1);
  assert.equal(lint(html, rules("body")).length, 1);
  assert.equal(lint(html, rules("any")).length, 2);
  assert.equal(lint(html, rules("head"))[0]?.loc?.line, 4);
  assert.equal(lint(html, rules("body"))[0]?.loc?.line, 7);
});

test("a rule whose selector has no leading tag still matches, via the wildcard bucket", () => {
  const rule: Rule = { meta: meta({ ruleId: "attr/any", selector: "[data-legacy]" }) };
  const findings = lint(doc('<meta data-legacy="1">', '<div data-legacy="1"></div>'), [rule]);
  assert.equal(findings.length, 2);
});

test("match: logic refines the selector rather than replacing it", () => {
  const seen: string[] = [];
  const rule: Rule = {
    meta: meta({ ruleId: "script/typed", selector: "script[type]", match: "logic" }),
    match: (element) => {
      seen.push(element.attr("type") ?? "");
      return element.attr("type") === "text/javascript";
    },
  };
  const findings = lint(
    doc('<script type="text/javascript"></script>\n<script type="module"></script>\n<script></script>'),
    [rule],
  );
  // The bare <script> never reaches the logic: the selector filtered it out.
  assert.deepEqual(seen, ["text/javascript", "module"]);
  assert.equal(findings.length, 1);
});

test("a document rule runs once and can report anywhere", () => {
  const rule: Rule = {
    meta: meta({ ruleId: "head/doc", kind: "document", match: "logic", scope: "head" }),
    check: (document, ctx) => {
      const found = document.querySelector("title");
      return found === null ? [] : [ctx.report(found, { detail: "found a title" })];
    },
  };
  const findings = lint(doc("<title>Hi</title>"), [rule]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.detail, "found a title");
  assert.equal(findings[0]?.node.tag, "title");
});

test("detectability: partial marks findings possible", () => {
  const rules: Rule[] = [
    { meta: meta({ ruleId: "meta/sure", selector: "meta[name]" }) },
    { meta: meta({ ruleId: "meta/maybe", selector: "meta[name]", detectability: "partial" }) },
  ];
  const findings = lint(doc('<meta name="a">'), rules);
  assert.equal(findings.find((f) => f.ruleId === "meta/sure")?.possible, false);
  assert.equal(findings.find((f) => f.ruleId === "meta/maybe")?.possible, true);
});

test("a finding carries the rule's severity, message, replacement and URL", () => {
  const rule: Rule = {
    meta: meta({
      ruleId: "meta/x",
      selector: "meta[name]",
      severity: "harmful",
      description: "It is bad.",
      replacement: "Use something else.",
    }),
  };
  const finding = lint(doc('<meta name="a">'), [rule])[0];
  assert.equal(finding?.severity, "harmful");
  assert.equal(finding?.message, "It is bad.");
  assert.equal(finding?.replacement, "Use something else.");
  assert.equal(finding?.url, "https://deadhead.dev/rules/meta/x");
});

test("findings are sorted by source position", () => {
  const rules: Rule[] = [
    { meta: meta({ ruleId: "z/last", selector: "title" }) },
    { meta: meta({ ruleId: "a/first", selector: "meta[charset]" }) },
  ];
  const findings = lint(doc('<meta charset="utf-8">\n<title>Hi</title>'), rules);
  assert.deepEqual(ids(findings), ["a/first", "z/last"]);
  assert.ok((findings[0]?.range?.[0] ?? 0) < (findings[1]?.range?.[0] ?? 0));
});

test("the same rule reporting the same element twice is deduplicated", () => {
  const rule: Rule = {
    meta: meta({ ruleId: "head/dupe", kind: "document", match: "logic" }),
    check: (document, ctx) => {
      const found = document.querySelector("title");
      return found === null ? [] : [ctx.report(found), ctx.report(found)];
    },
  };
  assert.equal(lint(doc("<title>Hi</title>"), [rule]).length, 1);
});

test("snippets come from the source and are truncated to 90 characters", () => {
  const long = `<meta name="description" content="${"x".repeat(200)}">`;
  const rule: Rule = { meta: meta({ ruleId: "meta/x", selector: "meta[name]" }) };
  const snippet = lint(doc(long), [rule])[0]?.node.snippet ?? "";
  assert.equal(snippet.length, 90);
  assert.ok(snippet.startsWith('<meta name="description"'));
  assert.ok(snippet.endsWith("…"));
});

test("suppression comments are honoured by the engine", () => {
  const rule: Rule = { meta: meta({ ruleId: "meta/x", selector: "meta[name]" }) };
  const html = doc('<!-- deadhead-disable-next-line meta/x -->\n<meta name="a">\n<meta name="b">');
  assert.equal(lint(html, [rule]).length, 2, "without suppressions");
  assert.equal(lint(html, [rule], true).length, 1, "with suppressions");
});

test("an unsupported selector is a build failure, not a silent no-match", () => {
  const rule: Rule = { meta: meta({ ruleId: "bad/sel", selector: "head > meta" }) };
  assert.throws(() => lint(doc("<title>Hi</title>"), [rule]), /unsupported selector/);
});

test("a rule that declares logic but ships none fails loudly", () => {
  const rule: Rule = { meta: meta({ ruleId: "meta/x", selector: "meta[name]", match: "logic" }) };
  assert.throws(() => lint(doc('<meta name="a">'), [rule]), /requires a match\(\) logic module/);
});
