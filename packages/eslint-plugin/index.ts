/**
 * `eslint-plugin-deadhead`.
 *
 * One ESLint rule per deadhead rule, named with the `ruleId` verbatim:
 *
 *     rules: { "deadhead/meta/http-equiv-x-ua-compatible": "error" }
 *
 * ESLint splits an unscoped rule id on the *first* slash, so the plugin is
 * `deadhead` and the rule name keeps its own slash. That matters more than it
 * looks: `ruleId` is permanent and users write suppression comments and CI
 * baselines against it, so the ESLint config, the CLI output and the markdown
 * all say the same string. Rewriting `meta/x` to `meta-x` here would create a
 * second name for the same thing.
 *
 * Deliberately the last runtime to be built. For framework users the head tags
 * often live in JSX, Vue or Svelte where an HTML parser never sees them, so
 * this is a convenience — the bookmarklet inspects rendered output, which is
 * the ground truth.
 */

import { run } from "../core/engine.ts";
import { parseSuppressions } from "../core/suppressions.ts";
import type { Rule as DeadheadRule } from "../core/engine.ts";
import type { Finding } from "../core/types.ts";
import { loadRules } from "../rules/load.ts";
import { fromProgram } from "./adapter.ts";

/** The slice of ESLint's API this plugin touches, described structurally. */
type SourceCode = {
  getText(): string;
  getLocFromIndex(index: number): { line: number; column: number };
};
type Fixer = { replaceTextRange(range: [number, number], text: string): unknown };
type Context = {
  sourceCode: SourceCode;
  report(descriptor: {
    loc: { start: { line: number; column: number }; end: { line: number; column: number } };
    messageId: string;
    data: Record<string, string>;
    fix?: (fixer: Fixer) => unknown;
  }): void;
};
type EslintRule = {
  meta: Record<string, unknown>;
  create(context: Context): Record<string, (node: unknown) => void>;
};

/**
 * A fix is offered only when the engine produced one. It is `null` for
 * `fix: { op: "none" }` and for every `detectability: "partial"` rule, so
 * ESLint is never handed an edit the CLI would refuse to make.
 */
const fixDescriptor = (
  fix: Finding["fix"],
): { fix?: (fixer: Fixer) => unknown } =>
  fix === null
    ? {}
    : { fix: (fixer: Fixer) => fixer.replaceTextRange([fix.range[0], fix.range[1]], fix.text) };

/**
 * `harmful` is a problem; the rest are suggestions. ESLint's `type` drives
 * editor presentation, not severity — severity is the user's config to set.
 */
const eslintType = (rule: DeadheadRule): string =>
  rule.meta.severity === "harmful" ? "problem" : "suggestion";

function toEslintRule(rule: DeadheadRule): EslintRule {
  return {
    meta: {
      type: eslintType(rule),
      // Autofix comes free: the project's fixes are already range-based text
      // edits, which is exactly what an ESLint fixer is. Declared only when the
      // rule actually has an op — claiming `fixable` and never fixing makes
      // `--fix` report work it did not do.
      ...(rule.meta.fix.op === "none" ? {} : { fixable: "code" as const }),
      docs: {
        description: rule.meta.description,
        url: `https://deadhead.dev/rules/${rule.meta.ruleId}`,
      },
      schema: [],
      messages: {
        // `detail` is optional, so it is passed as an empty string when absent
        // rather than making a second message id.
        finding: "{{message}} {{replacement}}{{detail}}",
      },
    },

    create(context) {
      return {
        // One pass over the whole program. Dispatching per-node would mean
        // reimplementing the engine's bucketing against ESLint's visitor keys,
        // and the two would drift.
        Program(node: unknown) {
          const source = context.sourceCode.getText();
          const findings = run([rule], fromProgram(node, source), {
            suppressions: parseSuppressions(source),
          });

          for (const finding of findings) {
            const range = finding.range;
            const start =
              range === null
                ? { line: finding.loc?.line ?? 1, column: (finding.loc?.col ?? 1) - 1 }
                : context.sourceCode.getLocFromIndex(range[0]);
            const end = range === null ? start : context.sourceCode.getLocFromIndex(range[1]);

            context.report({
              loc: { start, end },
              messageId: "finding",
              data: {
                message: finding.message,
                replacement: finding.replacement,
                detail: finding.detail === undefined ? "" : ` (${finding.detail})`,
              },
              ...fixDescriptor(finding.fix),
            });
          }
        },
      };
    },
  };
}

const loaded = await loadRules();

export const rules: Record<string, EslintRule> = Object.fromEntries(
  loaded.map((rule) => [rule.meta.ruleId, toEslintRule(rule)]),
);

export const meta = { name: "eslint-plugin-deadhead", version: "0.0.0" };

/**
 * Ready-made configs. `recommended` turns on everything that is not merely
 * `unnecessary`; `all` turns on every rule. Both need `@html-eslint/parser`,
 * which is the consumer's to install — this plugin only reads its AST.
 */
const enable = (list: DeadheadRule[]): Record<string, "error"> =>
  Object.fromEntries(
    list.map((rule): [string, "error"] => [`deadhead/${rule.meta.ruleId}`, "error"]),
  );

export const configs = {
  recommended: { rules: enable(loaded.filter((r) => r.meta.severity !== "unnecessary")) },
  all: { rules: enable(loaded) },
};

export default { meta, rules, configs };
