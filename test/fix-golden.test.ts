import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parseHtml } from "../packages/cli/adapter.ts";
import { applyFixes } from "../packages/core/fix.ts";
import { run } from "../packages/core/engine.ts";
import { parseSuppressions } from "../packages/core/suppressions.ts";
import { loadRules } from "../packages/rules/load.ts";

/**
 * Rules whose one-attribute fix cannot clear every finding on their own
 * fixture. Phase 2 adds `remove-attributes` and empties this set; a new entry
 * needs a reason in the PR.
 */
const KNOWN_PARTIAL: ReadonlySet<string> = new Set([
  "attr/a-coords-shape",
  "attr/area-obsolete",
  "attr/data-binding",
  "attr/global-contextmenu",
  "attr/input-ismap-usemap",
  "attr/input-number-size",
  "attr/menu-obsolete",
  "attr/object-obsolete",
  "attr/rev-urn",
]);

/**
 * Rules whose removal changes behaviour; see the fix-safety review. An entry
 * leaves only with new evidence.
 */
const MUST_NOT_FIX: ReadonlySet<string> = new Set([
  "attr/longdesc-lowsrc",
  "attr/name-obsolete",
  "attr/script-charset",
  "attr/script-event-for",
  "attr/script-language",
  "link/obsolete-rel",
  "link/rel-prerender",
  "meta/apple-mobile-web-app-status-bar-style",
  "meta/http-equiv-x-ua-compatible",
  "meta/msapplication",
  "meta/obsolete-name",
]);

const rules = await loadRules();
const fixable = rules.filter((r) => r.meta.fix.op !== "none" && r.meta.detectability !== "partial");

for (const id of MUST_NOT_FIX) {
  test(`${id}: fix op is none`, () => {
    const rule = rules.find((r) => r.meta.ruleId === id);
    assert.ok(rule, `${id} not found`);
    assert.equal(rule.meta.fix.op, "none");
  });
}

for (const rule of fixable) {
  const id = rule.meta.ruleId;
  test(`${id}: --fix emits a fix and leaves ${KNOWN_PARTIAL.has(id) ? "no more" : "no"} findings of its own`, async () => {
    const original = await readFile(new URL(`fixtures/${id}/invalid.html`, import.meta.url), "utf8");
    const lint = (source: string) => run([rule], parseHtml(source), { suppressions: parseSuppressions(source), fix: true });
    const before = lint(original);
    assert.ok(before.some((f) => f.fix !== null), "invalid.html produced no fix");

    let source = original;
    for (let pass = 0; pass < 10; pass++) {
      const fixes = lint(source).flatMap((f) => (f.fix === null ? [] : [f.fix]));
      if (fixes.length === 0) break;
      source = applyFixes(source, fixes).output;
    }
    const after = lint(source);
    if (KNOWN_PARTIAL.has(id)) {
      assert.notEqual(source, original, "the fix changed nothing");
      assert.ok(after.length <= before.length);
    } else assert.deepEqual(after.map((f) => f.node.snippet), []);
  });
}
