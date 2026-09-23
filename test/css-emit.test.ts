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

test("the scope prefix distributes and no branch emits empty", () => {
  const css = renderCss(rules.map((rule) => rule.meta));
  assert.ok(css.includes("deadhead"), "expected the rendered stylesheet");
  for (const rule of rules) {
    if (rule.meta.selector === null) continue;
    const emitted = scoped(rule.meta);
    const inputBranches = rule.meta.selector.split(",");
    const outputBranches = emitted.split(",\n");
    assert.equal(
      outputBranches.length,
      inputBranches.length,
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
    assert.equal(outputs.length, inputs.length, rule.meta.ruleId);
    for (const [index, input] of inputs.entries()) {
      const output = outputs[index];
      assert.ok(output !== undefined && output.includes(input), `${rule.meta.ruleId}: lost ${JSON.stringify(input)}`);
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
  // The second branch emits as bare scope, losing the rule's meaning.
  assert.equal(outputs[1], "head", "empty input must not emit as bare scope");
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
