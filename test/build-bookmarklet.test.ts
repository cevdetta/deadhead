import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import type { RuleMeta } from "../packages/core/vocabulary.ts";
import {
  GLOBAL,
  SLIM_KEYS,
  buildBootCall,
  buildRuleLiteral,
  bundleBookmarklet,
  logicEntryFor,
  logicVarName,
  needsLogic,
  toSlimMeta,
} from "../scripts/build-bookmarklet.ts";
import { loadRules } from "../packages/rules/load.ts";

const meta = (overrides: Partial<RuleMeta> = {}): RuleMeta => ({
  ruleId: "test/x",
  title: "Test rule",
  description: "A description.",
  pubDate: "2026-01-01",
  status: "avoid",
  severity: "unnecessary",
  standardsBasis: "spec",
  detectability: "yes",
  kind: "element",
  scope: "head",
  selector: "meta[name]",
  match: null,
  fix: { op: "none", attr: null, token: null },
  replacement: "Delete it.",
  tags: [],
  impacts: [],
  related: [],
  ...overrides,
});

test("slim literals carry exactly the keys the bookmarklet reads", () => {
  const slim = toSlimMeta(meta({}));
  assert.deepEqual([...Object.keys(slim)].sort(), [...SLIM_KEYS].sort());
  assert.deepEqual([...SLIM_KEYS].sort(), [
    "description",
    "detectability",
    "fix",
    "kind",
    "match",
    "replacement",
    "ruleId",
    "scope",
    "selector",
    "severity",
  ]);
  // Prose and site data must not ride the javascript: URL.
  for (const dropped of ["title", "pubDate", "status", "standardsBasis", "tags", "impacts", "related"]) {
    assert.ok(!(dropped in slim), `${dropped} leaked into the slim literal`);
  }
});

test("match vs check follows kind", () => {
  assert.equal(logicEntryFor(meta({ kind: "document" })), "check");
  assert.equal(logicEntryFor(meta({ kind: "element" })), "match");
  assert.equal(
    buildRuleLiteral(meta({ ruleId: "head/x", kind: "document" }), true),
    `{ meta: ${JSON.stringify(toSlimMeta(meta({ ruleId: "head/x", kind: "document" })))}` +
      `, check: ${GLOBAL}.${logicVarName(meta({ ruleId: "head/x", kind: "document" }))} }`,
  );
  const elementLiteral = buildRuleLiteral(
    meta({ ruleId: "meta/x", kind: "element", match: "logic" }),
    true,
  );
  assert.match(elementLiteral, /, match: __deadhead\.match_meta_x/);
  assert.doesNotMatch(elementLiteral, /check:/);
  // A selector-only element rule wires no logic.
  assert.doesNotMatch(buildRuleLiteral(meta({ kind: "element", match: null }), false), /match:|check:/);
});

test("needsLogic matches the assembly filter", () => {
  assert.equal(needsLogic(meta({ kind: "element", match: null })), false);
  assert.equal(needsLogic(meta({ kind: "element", match: "logic" })), true);
  assert.equal(needsLogic(meta({ kind: "document", match: null })), true);
});

test("the appended boot call survives minification", async () => {
  const json = JSON.parse(await readFile(new URL("../packages/rules/rules.json", import.meta.url), "utf8"));
  const bundle = await bundleBookmarklet(json.rules);
  const call = buildBootCall(["{ meta: {} }"]);
  assert.ok(call.startsWith(`${GLOBAL}.boot([`), "boot call shape changed");
  assert.ok(call.endsWith("]);"), "boot call must close the array");
  assert.ok(bundle.trimEnd().endsWith("]);"), "built bundle must end with the appended boot call");
  assert.ok(bundle.includes(`${GLOBAL}.boot([`), "built bundle lost its boot call");
});

test("every rule in rules.json assembles with the right entry", async () => {
  const rules = await loadRules();
  assert.ok(rules.length > 0);
  for (const rule of rules) {
    const hasLogic = needsLogic(rule.meta);
    const literal = buildRuleLiteral(rule.meta, hasLogic);
    if (!hasLogic) {
      assert.doesNotMatch(literal, /match:|check:/, rule.meta.ruleId);
      continue;
    }
    if (rule.meta.kind === "document") {
      assert.match(literal, /check: __deadhead\.check_/, rule.meta.ruleId);
      assert.doesNotMatch(literal, /match: __deadhead/, rule.meta.ruleId);
    } else {
      assert.match(literal, /match: __deadhead\.match_/, rule.meta.ruleId);
      assert.doesNotMatch(literal, /check: __deadhead/, rule.meta.ruleId);
    }
  }
});

test("bundleBookmarklet builds in memory and never touches .git", async () => {
  const { bundleBookmarklet } = await import("../scripts/build-bookmarklet.ts");
  const { readFile, stat } = await import("node:fs/promises");
  const json = JSON.parse(await readFile(new URL("../packages/rules/rules.json", import.meta.url), "utf8"));
  const bundle = await bundleBookmarklet(json.rules);
  assert.match(bundle, /__deadhead\.boot\(\[/);
  await assert.rejects(stat(new URL("../.git/deadhead/bundle-entry/entry.ts", import.meta.url)));
});
