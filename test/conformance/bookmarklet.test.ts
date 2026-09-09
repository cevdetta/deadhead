/**
 * The bookmarklet is built by a bundler written for this repo, so it needs the
 * same scrutiny as the adapters: the artifact must behave exactly like the
 * modules it was built from, or "runs the same rule set" is a claim rather
 * than a fact.
 *
 * The bundle is executed in a `vm` context whose only DOM is linkedom's, which
 * is as close to a page as this suite can get without a browser.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";

import { parseHTML } from "linkedom";

import { fromDocument } from "../../packages/browser/adapter.ts";
import { collectFiles } from "../../packages/cli/lint.ts";
import { loadRules } from "../../packages/rules/load.ts";
import { run } from "../../packages/core/index.ts";
import type { Finding } from "../../packages/core/types.ts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const script = (name: string) => fileURLToPath(new URL(`../../scripts/${name}`, import.meta.url));

for (const step of ["build-rules.ts", "build-bookmarklet.ts"]) {
  const built = spawnSync(process.execPath, [script(step)], { cwd: ROOT, encoding: "utf8" });
  assert.equal(built.status, 0, `${step} failed:\n${built.stderr}`);
}

const bundle = await readFile(new URL("../../packages/browser/bookmarklet.js", import.meta.url), "utf8");
const rules = await loadRules();

/** Run the built artifact against a document, the way a bookmarklet would. */
const viaBundle = (source: string): { findings: Finding[]; panel: boolean } => {
  const { window, document } = parseHTML(source);
  const findings = [...(vm.runInNewContext(bundle, { document, window }) as Finding[])];
  return { findings, panel: document.getElementById("deadhead-panel") !== null };
};

const viaModules = (source: string): Finding[] =>
  run(rules, fromDocument(parseHTML(source).document));

test("the bundle finds exactly what the modules find, on every fixture", async () => {
  const files = await collectFiles(["test/fixtures"]);
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.deepEqual(
      viaBundle(source).findings.map((f) => f.ruleId),
      viaModules(source).map((f) => f.ruleId),
      file,
    );
  }
});

test("the bundle carries every rule, including the ones that need code", () => {
  for (const rule of rules) {
    assert.ok(
      bundle.includes(JSON.stringify(rule.meta.ruleId)),
      `${rule.meta.ruleId} is not inlined in the bundle`,
    );
  }
  // The logic modules must be inlined too, not merely referenced.
  assert.match(bundle, /JAVASCRIPT_MIME_ESSENCES/, "script logic missing");
  assert.match(bundle, /PRESCAN_LIMIT/, "charset logic missing");
});

test("nothing in the bundle can be blocked by a Content-Security-Policy", () => {
  // The point of inlining everything: a page worth inspecting is often a page
  // with a strict CSP, and a single network call would make the tool useless
  // exactly where it is most useful.
  for (const forbidden of ["fetch(", "XMLHttpRequest", "importScripts", "eval("]) {
    assert.ok(!bundle.includes(forbidden), `bundle references ${forbidden}`);
  }
  assert.doesNotMatch(bundle, /\bimport\s*\(/, "bundle uses a dynamic import");
  assert.doesNotMatch(bundle, /^\s*(?:import|export)\s/m, "bundle still has module syntax");
});

test("it renders a panel, and running it twice does not stack panels", () => {
  const source = "<!doctype html><html><head><title>t</title>" +
    '<meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body></body></html>';
  const { window, document } = parseHTML(source);
  const context = { document, window };
  vm.runInNewContext(bundle, context);
  vm.runInNewContext(bundle, context);
  assert.equal(document.querySelectorAll("#deadhead-panel").length, 1);
  assert.match(document.getElementById("deadhead-panel")?.textContent ?? "", /1 finding/);
});

test("a clean document says so rather than showing an empty list", () => {
  const source = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    "<title>t</title></head><body></body></html>";
  const { findings, panel } = viaBundle(source);
  // Compare length, not the array: values crossing a vm realm boundary have a
  // different Array prototype and deepStrictEqual compares prototypes.
  assert.equal(findings.length, 0);
  assert.ok(panel);
});
