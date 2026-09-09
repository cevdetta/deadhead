import type { Finding } from "../../core/types.ts";
import type { Severity } from "../../core/vocabulary.ts";

export type FileResult = { file: string; findings: Finding[] };
export type Reporter = (results: FileResult[]) => string;

/** Counts per severity, in the fixed `harmful, deprecated, unnecessary` order. */
export function tally(results: FileResult[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { harmful: 0, deprecated: 0, unnecessary: 0 };
  for (const result of results) {
    for (const finding of result.findings) counts[finding.severity]++;
  }
  return counts;
}

export const total = (results: FileResult[]): number =>
  results.reduce((sum, result) => sum + result.findings.length, 0);
