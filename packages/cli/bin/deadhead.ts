#!/usr/bin/env node
/**
 * `deadhead` — lint HTML for deprecated, unnecessary and harmful markup.
 *
 * Exit codes are the contract CI depends on:
 *   0  no finding at or above the `--fail-on` threshold
 *   1  threshold met
 *   2  usage, config, I/O error, or an internal error
 *
 * The distinction matters: a broken invocation and a clean run must never look
 * the same to a build script, and findings must never look like a crash.
 */

import { matchesGlob } from "node:path";
import { parseArgs, styleText } from "node:util";
import { enableCompileCache } from "node:module";

// Caches compiled module code between runs (Node ≥22.1). A no-op when the
// cache directory is not writable; never affects results.
enableCompileCache?.();

import { type Rule } from "../../core/engine.ts";
import { SEVERITY, SEVERITY_RANK, SITE_URL } from "../../core/vocabulary.ts";
import { RulesNotBuiltError, loadRules } from "../../rules/load.ts";
import {
  BaselineError,
  applyBaseline,
  readBaseline,
  summarise,
  writeBaseline,
} from "../baseline.ts";
import { ConfigError, fromConfigDir, loadConfig } from "../config.ts";
import { UsageError, collectFiles, lintFiles } from "../lint.ts";
import { type Reporter, tally, total, totalFixed } from "../reporters/index.ts";
import { json } from "../reporters/json.ts";
import { sarif } from "../reporters/sarif.ts";
import { stylish } from "../reporters/stylish.ts";

const REPORTERS: Record<string, Reporter> = { stylish, json, sarif };
const FAIL_ON = [...SEVERITY, "none"] as const;
type Threshold = (typeof FAIL_ON)[number];

const isThreshold = (value: unknown): value is Threshold =>
  value === "none" || (typeof value === "string" && SEVERITY.some((known) => known === value));

const USAGE = `
${styleText("bold", "deadhead")} — lint HTML <head> for deprecated, unnecessary and harmful markup

  ${styleText("bold", "Usage:")} deadhead [options] [file|dir|glob]...

  -f, --format <name>     stylish (default), json, sarif
      --fail-on <level>   exit 1 when a finding is this severe or worse:
                          harmful, deprecated, unnecessary (default), none
      --fix               rewrite files in place, then report what is left
      --skip-templates    do not lint the contents of <template>
      --no-head-only      walk <body> even when no active rule is scoped
                          beyond <head> (head-only mode skips the walk;
                          findings are unchanged, it only costs the walk)
  -c, --config <path>     defaults to ./deadhead.config.ts when present
      --baseline <path>   ignore findings the baseline already accounts for
      --update-baseline   rewrite the baseline from this run, then exit 0
  -h, --help              show this
  -v, --version           show the version

  ${styleText("dim", `Every finding links to ${SITE_URL}/rules/<ruleId>.`)}
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
      "fail-on": { type: "string" },
      fix: { type: "boolean", default: false },
      "skip-templates": { type: "boolean" },
      "no-head-only": { type: "boolean", default: false },
      config: { type: "string", short: "c" },
      baseline: { type: "string" },
      "update-baseline": { type: "boolean", default: false },
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
  const { readFile } = await import("node:fs/promises");
  const pkg: { version?: string } = JSON.parse(
    await readFile(new URL("../../../package.json", import.meta.url), "utf8"),
  );
  process.stdout.write(`${pkg.version ?? "0.0.0"}\n`);
  process.exit(0);
}

const reporter = REPORTERS[values.format];
if (reporter === undefined) {
  fail(`unknown --format ${JSON.stringify(values.format)} (expected ${Object.keys(REPORTERS).join(", ")})`);
}

/** Config supplies defaults; an explicit flag always wins. */
try {
  const allRules = await loadRules();
  const loaded = await loadConfig(
    process.cwd(),
    values.config,
    new Set(allRules.map((rule) => rule.meta.ruleId)),
  );
  const config = loaded?.config ?? {};

  const threshold = values["fail-on"] ?? config.failOn ?? "unnecessary";
  if (!isThreshold(threshold)) {
    fail(`unknown --fail-on ${JSON.stringify(threshold)} (expected ${FAIL_ON.join(", ")})`);
  }

  // `off` drops the rule entirely rather than filtering its findings later, so
  // it costs nothing to have it disabled.
  const settings = config.rules ?? {};
  const rules: Rule[] = allRules
    .filter((rule) => settings[rule.meta.ruleId] !== "off")
    .map((rule) => {
      const override = settings[rule.meta.ruleId];
      return override === undefined || override === "off"
        ? rule
        : { ...rule, meta: { ...rule.meta, severity: override } };
    });

  const targets = positionals.length > 0 ? positionals : (config.include ?? []);
  if (targets.length === 0) {
    process.stderr.write(USAGE);
    process.exit(2);
  }

  const ignore = config.ignore ?? [];
  const found = await collectFiles(targets);
  const files = found.filter((file) => !ignore.some((pattern) => matchesGlob(file, pattern)));

  if (files.length === 0) {
    fail(
      found.length === 0
        ? `no HTML files found in: ${targets.join(", ")}`
        : `every HTML file in: ${targets.join(", ")} is ignored by config`,
    );
  }

  const skipTemplates = values["skip-templates"] ?? config.skipTemplates ?? false;
  const { results, visitBody } = await lintFiles(files, rules, {
    skipTemplates,
    fix: values.fix,
    headOnly: !values["no-head-only"],
  });

  // Head-only mode is silent by design of the engine — the walk just never
  // descends — so say so on stderr, where machine-readable stdout stays
  // clean. It applies only when the active rule set allows it, which with
  // the shipped rules means the user switched the body-scoped ones off.
  if (values["no-head-only"] !== true && !visitBody) {
    process.stderr.write(
      `${styleText("dim", "head-only mode: no active rule is scoped beyond <head>, so the <body> walk is skipped (pass --no-head-only to walk it anyway)")}\n`,
    );
  }

  const baselinePath =
    values.baseline ??
    (loaded && config.baseline !== undefined ? fromConfigDir(loaded, config.baseline) : undefined);

  if (values["update-baseline"]) {
    if (baselinePath === undefined) {
      fail("--update-baseline needs --baseline <path>, or `baseline` in the config");
    }
    const baseline = summarise(results);
    await writeBaseline(baselinePath, baseline);
    const count = total(results);
    process.stdout.write(
      `${styleText("green", "✓")} baseline written to ${baselinePath} ` +
        `(${count} finding${count === 1 ? "" : "s"} accepted)\n`,
    );
    process.exit(0);
  }

  let reported = results;
  let resolved = 0;
  if (baselinePath !== undefined) {
    const applied = applyBaseline(results, await readBaseline(baselinePath));
    reported = applied.results;
    resolved = applied.resolved;
  }

  process.stdout.write(reporter(reported));

  const fixed = totalFixed(results);
  if (fixed > 0) {
    process.stdout.write(
      `${styleText("green", "✓")} fixed ${fixed} finding${fixed === 1 ? "" : "s"}\n`,
    );
  }
  if (resolved > 0) {
    process.stdout.write(
      `${styleText("dim", `${resolved} baseline entr${resolved === 1 ? "y is" : "ies are"} ` +
        "no longer needed; re-run with --update-baseline to prune")}\n`,
    );
  }

  if (threshold === "none" || total(reported) === 0) process.exitCode = 0;
  else {
    // A threshold fails on itself and on everything worse: --fail-on=deprecated
    // also fails on harmful.
    const counts = tally(reported);
    const floor = SEVERITY_RANK[threshold];
    const breached = SEVERITY.some(
      (severity) => counts[severity] > 0 && SEVERITY_RANK[severity] >= floor,
    );
    process.exitCode = breached ? 1 : 0;
  }

  // process.exit() drops whatever stdout still holds when the destination is a
  // pipe, so a large report lost its tail here (a SARIF run over the fixtures
  // corpus ended mid-object). Park the code above and let the stream drain;
  // falling off the end exits with that code.
  if (process.stdout.writableLength > 0) {
    await new Promise<void>((resolve) => {
      process.stdout.once("drain", () => resolve());
      process.stdout.once("error", () => resolve());
    });
  }
} catch (err) {
  if (err instanceof UsageError || err instanceof RulesNotBuiltError) fail(err.message);
  if (err instanceof ConfigError || err instanceof BaselineError) fail(err.message);
  // Anything else is an I/O failure or a bug. Exit 1 means "findings"; a crash
  // must never look like one, so it is 2 with the cause on stderr.
  const code = (err as NodeJS.ErrnoException).code;
  fail(
    code !== undefined
      ? `${code}: ${(err as Error).message}`
      : `internal error: ${(err as Error).stack ?? String(err)}`,
  );
}
