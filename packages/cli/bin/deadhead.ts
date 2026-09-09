#!/usr/bin/env node
/**
 * `deadhead` — lint HTML for deprecated, unnecessary and harmful markup.
 *
 * Exit codes are the contract CI depends on:
 *   0  no finding at or above the `--fail-on` threshold
 *   1  threshold met
 *   2  usage or I/O error
 *
 * The distinction matters: a broken invocation and a clean run must never look
 * the same to a build script, and findings must never look like a crash.
 */

import { parseArgs, styleText } from "node:util";

import { SEVERITY, SEVERITY_RANK, type Severity } from "../../core/vocabulary.ts";
import { RulesNotBuiltError, loadRules } from "../../rules/load.ts";
import { UsageError, collectFiles, lintFiles } from "../lint.ts";
import { type Reporter, tally, total } from "../reporters/index.ts";
import { json } from "../reporters/json.ts";
import { sarif } from "../reporters/sarif.ts";
import { stylish } from "../reporters/stylish.ts";

const REPORTERS: Record<string, Reporter> = { stylish, json, sarif };
const FAIL_ON = [...SEVERITY, "none"] as const;

const USAGE = `
${styleText("bold", "deadhead")} — lint HTML <head> for deprecated, unnecessary and harmful markup

  ${styleText("bold", "Usage:")} deadhead [options] <file|dir>...

  -f, --format <name>    stylish (default), json, sarif
      --fail-on <level>  exit 1 when a finding is this severe or worse:
                         harmful, deprecated, unnecessary (default), none
      --skip-templates   do not lint the contents of <template>
  -h, --help             show this
  -v, --version          show the version

  ${styleText("dim", "Every finding links to https://deadhead.dev/rules/<ruleId>.")}
`.trimStart();

const fail: (message: string) => never = (message) => {
  process.stderr.write(`${styleText("red", "error")} ${message}\n`);
  process.exit(2);
};

let values;
let positionals: string[];
try {
  ({ values, positionals } = parseArgs({
    options: {
      format: { type: "string", short: "f", default: "stylish" },
      "fail-on": { type: "string", default: "unnecessary" },
      "skip-templates": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
    allowPositionals: true,
  }));
} catch (err) {
  fail(err instanceof Error ? err.message : String(err));
}

if (values.help) {
  process.stdout.write(USAGE);
  process.exit(0);
}

if (values.version) {
  const pkg: { version?: string } = JSON.parse(
    await (await import("node:fs/promises")).readFile(
      new URL("../../../package.json", import.meta.url),
      "utf8",
    ),
  );
  process.stdout.write(`${pkg.version ?? "0.0.0"}\n`);
  process.exit(0);
}

const reporter = REPORTERS[values.format];
if (reporter === undefined) {
  fail(`unknown --format ${JSON.stringify(values.format)} (expected ${Object.keys(REPORTERS).join(", ")})`);
}

const threshold = values["fail-on"];
if (!(FAIL_ON as readonly string[]).includes(threshold)) {
  fail(`unknown --fail-on ${JSON.stringify(threshold)} (expected ${FAIL_ON.join(", ")})`);
}

if (positionals.length === 0) {
  process.stderr.write(USAGE);
  process.exit(2);
}

try {
  const rules = await loadRules();
  const files = await collectFiles(positionals);
  const results = await lintFiles(files, rules, { skipTemplates: values["skip-templates"] });

  process.stdout.write(reporter(results));

  if (threshold === "none" || total(results) === 0) process.exit(0);

  // A threshold fails on itself and on everything worse: --fail-on=deprecated
  // also fails on harmful.
  const counts = tally(results);
  const floor = SEVERITY_RANK[threshold as Severity];
  const breached = SEVERITY.some(
    (severity) => counts[severity] > 0 && SEVERITY_RANK[severity] >= floor,
  );
  process.exit(breached ? 1 : 0);
} catch (err) {
  if (err instanceof UsageError || err instanceof RulesNotBuiltError) fail(err.message);
  throw err;
}
