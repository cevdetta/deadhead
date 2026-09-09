import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { loadRules } from "../packages/cli/load.ts";
import { collectFiles, lintFiles } from "../packages/cli/lint.ts";
import { ROOT, loadRules as loadMarkdown } from "../scripts/rules-source.ts";

const BIN = fileURLToPath(new URL("../packages/cli/bin/deadhead.ts", import.meta.url));
const BUILD = fileURLToPath(new URL("../scripts/build-rules.ts", import.meta.url));

// rules.json is generated and gitignored, so make sure it reflects the
// markdown before the binary is asked to load it.
const built = spawnSync(process.execPath, [BUILD], { cwd: ROOT, encoding: "utf8" });
assert.equal(built.status, 0, "build-rules failed: " + built.stderr);

const deadhead = (...args: string[]) =>
  spawnSync(process.execPath, [BIN, ...args], { cwd: ROOT, encoding: "utf8" });

const rules = await loadRules();
const { rules: markdown } = await loadMarkdown();

// --- the rule set the CLI loads matches the rule set on disk ----------------

test("every rule in content/rules is loaded, with its logic module attached", () => {
  assert.equal(rules.length, markdown.length);
  for (const rule of rules) {
    if (rule.meta.kind === "document") {
      assert.equal(typeof rule.check, "function", `${rule.meta.ruleId} needs check()`);
    } else if (rule.meta.match === "logic") {
      assert.equal(typeof rule.match, "function", `${rule.meta.ruleId} needs match()`);
    }
  }
});

// --- fixtures actually behave the way their rule says they do ---------------

test("each invalid.html trips its own rule", async () => {
  for (const rule of rules) {
    const file = `test/fixtures/${rule.meta.ruleId}/invalid.html`;
    const [result] = await lintFiles(await collectFiles([file]), rules);
    const own = result?.findings.filter((f) => f.ruleId === rule.meta.ruleId) ?? [];
    assert.ok(own.length > 0, `${file} produced no ${rule.meta.ruleId} finding`);
    for (const finding of own) {
      assert.equal(finding.severity, rule.meta.severity);
      assert.equal(finding.url, `https://deadhead.dev/rules/${rule.meta.ruleId}`);
      assert.ok(finding.loc !== null && finding.range !== null, "CLI findings carry positions");
    }
  }
});

test("each valid.html is clean, and clean of every rule, not just its own", async () => {
  const files = await collectFiles(["test/fixtures/*/*/valid.html"]);
  assert.equal(files.length, rules.length);
  const results = await lintFiles(files, rules);
  const findings = results.flatMap((r) => r.findings.map((f) => `${r.file}: ${f.ruleId}`));
  assert.deepEqual(findings, []);
});

// --- exit codes are the contract CI depends on ------------------------------

test("exit 0 when nothing is found", () => {
  const run = deadhead("test/fixtures/*/*/valid.html");
  assert.equal(run.status, 0);
  assert.match(run.stdout, /no findings/);
});

test("exit 1 when the --fail-on threshold is met, 0 when it is not", () => {
  assert.equal(deadhead("test/fixtures").status, 1, "default threshold is any finding");
  assert.equal(deadhead("--fail-on=harmful", "test/fixtures/head").status, 1);
  // The script fixtures are `unnecessary`, which is below a harmful threshold.
  assert.equal(deadhead("--fail-on=harmful", "test/fixtures/script").status, 0);
  assert.equal(deadhead("--fail-on=none", "test/fixtures").status, 0);
});

test("exit 2 for usage and I/O errors, never 1", () => {
  assert.equal(deadhead().status, 2, "no arguments");
  assert.equal(deadhead("does-not-exist.html").status, 2);
  assert.equal(deadhead("--format=nope", "test/fixtures").status, 2);
  assert.equal(deadhead("--fail-on=nope", "test/fixtures").status, 2);
  assert.match(deadhead("--format=nope", "test/fixtures").stderr, /unknown --format/);
});

test("--help and --version exit 0 and write to stdout", async () => {
  const help = deadhead("--help");
  assert.equal(help.status, 0);
  assert.match(help.stdout, /Usage: deadhead/);

  const pkg: { version: string } = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );
  const version = deadhead("--version");
  assert.equal(version.status, 0);
  assert.equal(version.stdout.trim(), pkg.version);
});

// --- reporters --------------------------------------------------------------

test("json output is parseable and its summary matches its findings", () => {
  const run = deadhead("--format=json", "test/fixtures");
  const report = JSON.parse(run.stdout) as {
    summary: { findings: number; harmful: number; unnecessary: number };
    results: { file: string; findings: { ruleId: string }[] }[];
  };
  const counted = report.results.reduce((n, r) => n + r.findings.length, 0);
  assert.equal(report.summary.findings, counted);
  assert.equal(report.summary.harmful + report.summary.unnecessary, counted);
});

test("sarif output is parseable and declares every rule it references", () => {
  const run = deadhead("--format=sarif", "test/fixtures");
  const report = JSON.parse(run.stdout) as {
    version: string;
    runs: {
      tool: { driver: { rules: { id: string; helpUri: string }[] } };
      results: { ruleId: string; level: string; locations: unknown[] }[];
    }[];
  };
  assert.equal(report.version, "2.1.0");
  const first = report.runs[0];
  assert.ok(first);
  const declared = new Set(first.tool.driver.rules.map((r) => r.id));
  for (const result of first.results) {
    assert.ok(declared.has(result.ruleId), `${result.ruleId} referenced but not declared`);
    assert.ok(["error", "warning", "note"].includes(result.level));
    assert.equal(result.locations.length, 1);
  }
  for (const rule of first.tool.driver.rules) {
    assert.match(rule.helpUri, /^https:\/\/deadhead\.dev\/rules\//);
  }
});

test("colour is dropped when stdout is not a terminal", () => {
  // spawnSync gives the child a pipe, so styleText must emit no escape codes.
  const ESC = String.fromCharCode(27);
  assert.ok(!deadhead("test/fixtures").stdout.includes(ESC));
});

// --- file collection --------------------------------------------------------

test("directories are walked, globs are expanded by the CLI, files are taken as given", async () => {
  const walked = await collectFiles(["test/fixtures"]);
  assert.equal(walked.length, rules.length * 2);

  const globbed = await collectFiles(["test/fixtures/*/*/invalid.html"]);
  assert.equal(globbed.length, rules.length);

  const explicit = await collectFiles(["test/fixtures/head/charset-position/valid.html"]);
  assert.deepEqual(explicit, ["test/fixtures/head/charset-position/valid.html"]);
});

test("node_modules is never walked", async () => {
  const files = await collectFiles(["."]);
  assert.deepEqual(files.filter((f) => f.includes("node_modules")), []);
});
