/**
 * The try page's logic, kept out of the page so Node can test it: lint pasted
 * HTML with the CLI's own path (`packages/cli/source.ts`, parse5 included) and
 * shape the result for display. Nothing here touches the DOM.
 */
import { analyseSource, lintSource } from "../../../packages/cli/source.ts";
import type { CompiledRules, Finding } from "../../../packages/core/index.ts";
import type { Severity } from "../../../packages/core/vocabulary.ts";

export type ViewFinding = {
  line: number | null;
  col: number | null;
  ruleId: string;
  severity: Severity;
  possible: boolean;
  message: string;
  replacement: string;
  url: string;
  snippet: string;
  detail: string | null;
  fixable: boolean;
};

export type LintView = {
  findings: ViewFinding[];
  counts: Record<Severity, number>;
  fixed: number;
  output: string;
};

const view = (finding: Finding): ViewFinding => ({
  line: finding.loc?.line ?? null,
  col: finding.loc?.col ?? null,
  ruleId: finding.ruleId,
  severity: finding.severity,
  possible: finding.possible,
  message: finding.message,
  replacement: finding.replacement,
  url: finding.url,
  snippet: finding.node.snippet,
  detail: finding.detail ?? null,
  fixable: finding.fix !== null,
});

/**
 * Findings as the CLI reports them, each marked with whether `--fix` removes
 * it, and the HTML `--fix` would write. The first pass runs with fixes on so
 * each finding carries its edit; `lintSource` runs the full fix loop.
 */
export function lintHtml(html: string, compiled: CompiledRules): LintView {
  const findings = analyseSource(html, compiled, { fix: true }).map(view);
  const { output, fixed } = lintSource(html, "input.html", compiled, { fix: true });
  const counts: Record<Severity, number> = { harmful: 0, deprecated: 0, unnecessary: 0 };
  for (const finding of findings) counts[finding.severity]++;
  return { findings, counts, fixed, output };
}
