/**
 * Every shipped selector must survive native `querySelectorAll`.
 *
 * The browser adapter hands its selector straight to the browser. The core
 * matcher agrees by construction only when the selector is one QSA accepts
 * verbatim; anything else throws in the page and the bookmarklet reports
 * nothing. This pins that intersection against `rules.json`.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { parseHTML } from "linkedom";

import { fromDocument } from "../../packages/browser/adapter.ts";
import { loadRules } from "../../packages/rules/load.ts";

const rules = await loadRules();
const selectors = rules.flatMap((rule) =>
  rule.meta.selector === null
    ? []
    : [{ ruleId: rule.meta.ruleId, selector: rule.meta.selector }],
);

test("the suite actually has selectors to gate", () => {
  assert.ok(selectors.length > 0, "no selector-backed rules found");
});

for (const meta of selectors) {
  const selector = meta.selector;
  test(`QSA accepts ${meta.ruleId}: ${selector}`, () => {
    const { document } = parseHTML(
      '<!doctype html><html lang="en"><head><title>t</title></head><body></body></html>',
    );
    assert.doesNotThrow(
      () => document.querySelectorAll(selector),
      `${meta.ruleId}: native QSA threw on ${JSON.stringify(selector)}`,
    );
    assert.doesNotThrow(
      () => document.querySelector(selector),
      `${meta.ruleId}: native querySelector threw on ${JSON.stringify(selector)}`,
    );
  });
}

test("the DOM port queries without throwing on every shipped selector", () => {
  const { document } = parseHTML(
    '<!doctype html><html lang="en"><head><title>t</title><meta charset="utf-8"></head><body></body></html>',
  );
  const parsed = fromDocument(document);
  for (const meta of selectors) {
    const selector = meta.selector;
    assert.doesNotThrow(
      () => parsed.doc.querySelectorAll(selector),
      `${meta.ruleId}: DOM port threw on ${JSON.stringify(selector)}`,
    );
  }
});
