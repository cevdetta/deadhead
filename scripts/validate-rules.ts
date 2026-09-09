#!/usr/bin/env node
/**
 * CI gate for the rule corpus. Runs before the build in `.github/workflows/ci.yml`
 * so a malformed frontmatter field fails in two seconds rather than after the
 * whole suite.
 *
 * Everything it checks is a rule that cannot be recovered from later: a `ruleId`
 * that disagrees with its path breaks suppression comments, a rule with one
 * source is an opinion, and an orphan logic module is undocumented behaviour.
 */

import { styleText } from "node:util";

import { checkLogicModules, loadRules, printDiagnostics } from "./rules-source.ts";

const { rules, diagnostics } = await loadRules();
diagnostics.push(...(await checkLogicModules(rules)));
diagnostics.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col);

if (diagnostics.length > 0) {
  printDiagnostics(diagnostics);
  const count = `${diagnostics.length} problem(s) in ${new Set(diagnostics.map((d) => d.file)).size} file(s)`;
  process.stderr.write(`\n${styleText("red", count)}\n`);
  process.exit(1);
}

process.stdout.write(`${styleText("green", "✓")} ${rules.length} rule(s) valid\n`);
