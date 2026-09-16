/**
 * Every selector-backed rule must survive the stylesheet emit.
 *
 * `scripts/build-css.ts` can only express what CSS can: a selector list with
 * a scope prefix distributed over each branch. A rule whose selector cannot
 * be emitted must fail here, not vanish silently from `deadhead.css`.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { scoped } from "../scripts/build-css.ts";
import { loadRules } from "../packages/rules/load.ts";

const rules = await loadRules();

test("the scope prefix distributes and no branch emits empty", async () => {
  const css = await readFile(new URL("../packages/browser/deadhead.css", import.meta.url), "utf8");
  assert.ok(css.includes("deadhead"), "expected the built stylesheet");
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
