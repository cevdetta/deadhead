/**
 * Every selector-backed rule must survive the stylesheet emit.
 *
 * `scripts/build-css.ts` can only express what CSS can: a selector list with
 * a scope prefix distributed over each branch. A rule whose selector cannot
 * be emitted must fail here, not vanish silently from `deadhead.css`.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { renderCss, scoped } from "../scripts/build-css.ts";
import { loadRules } from "../packages/rules/load.ts";

const rules = await loadRules();

test("scope becomes the CSS ancestor", () => {
  assert.equal(scoped({ scope: "head", selector: "meta[charset]" }), "head meta[charset]");
  assert.equal(scoped({ scope: "body", selector: "font[color]" }), "body font[color]");
  assert.equal(scoped({ scope: "any", selector: "meta[charset]" }), "meta[charset]");
});

test("the scope element itself is in scope, the way the walker counts it", () => {
  // `body body[bgcolor]` would never match: body has no body ancestor.
  assert.equal(scoped({ scope: "body", selector: "body[bgcolor], font[color]" }), "body[bgcolor],\nbody font[color]");
  assert.equal(scoped({ scope: "head", selector: "head[profile]" }), "head[profile]");
});

test("the scope prefix distributes over every comma branch", () => {
  assert.equal(
    scoped({ scope: "head", selector: "meta[name], meta[property]" }),
    "head meta[name],\nhead meta[property]",
  );
  assert.equal(
    scoped({ scope: "any", selector: "meta[name], meta[property]" }),
    "meta[name],\nmeta[property]",
  );
});

test("the scope prefix distributes and no branch emits empty", async () => {
  const { SVG_CAMEL } = await import("../scripts/svg-names.ts");
  const css = renderCss(rules);
  assert.ok(css.includes("deadhead"), "expected the rendered stylesheet");
  for (const rule of rules) {
    if (rule.meta.selector === null) continue;
    const emitted = scoped(rule.meta);
    const inputBranches = rule.meta.selector.split(",");
    const doubled = inputBranches.filter((branch) => {
      const tag = /^[a-z][a-z0-9-]*/.exec(branch.trim())?.[0];
      return tag !== undefined && SVG_CAMEL.has(tag);
    }).length;
    const outputBranches = emitted.split(",\n");
    assert.equal(
      outputBranches.length,
      inputBranches.length + doubled,
      `${rule.meta.ruleId}: scope prefix must distribute over every comma branch`,
    );
    for (const branch of outputBranches) {
      assert.ok(branch.trim().length > 0, `${rule.meta.ruleId}: emitted an empty branch`);
    }
  }
});

test("each rules.json selector with a value survives the emit", () => {
  for (const rule of rules) {
    const selector = rule.meta.selector;
    if (selector === null) continue;
    assert.ok(selector.trim().length > 0, `${rule.meta.ruleId}: selector is empty`);
    const inputs = selector.split(",").map((part) => part.trim());
    for (const input of inputs) {
      assert.ok(input.length > 0, `${rule.meta.ruleId}: selector has an empty comma branch`);
    }
    const emitted = scoped(rule.meta);
    const outputs = emitted.split(",\n").map((part) => part.trim());
    assert.ok(outputs.length >= inputs.length, rule.meta.ruleId);
    for (const input of inputs) {
      assert.ok(outputs.some((output) => output.includes(input)), `${rule.meta.ruleId}: lost ${JSON.stringify(input)}`);
    }
  }
});

test("an unemittable selector fails instead of dropping the rule", () => {
  // The emit has no allowlist: anything that reaches it must come out intact.
  // A trailing comma is the shape that would silently gain a scope-only branch.
  const selector = "meta[name], ";
  const inputs = selector.split(",").map((part) => part.trim());
  assert.ok(
    inputs.some((part) => part.length === 0),
    "test shape must contain an empty input branch",
  );
  const emitted = scoped({ scope: "head", selector });
  const outputs = emitted.split(",\n").map((part) => part.trim());
  // The empty branch is dropped, never emitted as a bare scope.
  assert.deepEqual(outputs, ["head meta[name]"]);
});

test("an SVG camelCase element gets its camelCase spelling in the stylesheet", async () => {
  const { scoped } = await import("../scripts/build-css.ts");
  const css = scoped({ scope: "any", selector: "lineargradient[x], rect[y]" });
  assert.match(css, /linearGradient\[x\]/);
  assert.match(css, /lineargradient\[x\]/);
  assert.doesNotMatch(css, /Rect/);
});

test("importing build-css writes nothing", async () => {
  const { stat } = await import("node:fs/promises");
  const out = new URL("../packages/browser/deadhead.css", import.meta.url);
  const before = await stat(out).then((s) => s.mtimeMs, () => 0);
  const mod = await import("../scripts/build-css.ts?probe=" + Date.now());
  assert.equal(typeof mod.renderCss, "function");
  const after = await stat(out).then((s) => s.mtimeMs, () => 0);
  assert.equal(after, before);
});

test("a rule refined by code stays out; a module exporting only fixable stays in", async () => {
  const { selectorDecides } = await import("../scripts/build-css.ts");
  const byId = new Map(rules.map((rule) => [rule.meta.ruleId, rule]));
  // document/html-lang's selector is `html`: drawing it would outline every page.
  assert.equal(selectorDecides(byId.get("document/html-lang")!), false);
  // attr/script-language exports fixable() alone: its selector decides findings.
  assert.equal(selectorDecides(byId.get("attr/script-language")!), true);
  const css = renderCss(rules);
  assert.doesNotMatch(css, /· document\/html-lang"/);
  assert.match(css, /· attr\/script-language"/);
  assert.doesNotMatch(css, /approximate|dashed/);
});
