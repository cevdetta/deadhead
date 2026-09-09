/**
 * Human-readable output.
 *
 * Deliberately wordier than a typical linter: the point of the project is that
 * every finding carries a researched explanation, so the replacement and the
 * rule's URL are part of the report, not a footnote you have to go look up.
 */

import { styleText } from "node:util";

import type { Severity } from "../../core/vocabulary.ts";
import { type Reporter, tally, total } from "./index.ts";

type Colour = Parameters<typeof styleText>[0];

const SEVERITY_COLOUR: Record<Severity, Colour> = {
  harmful: "red",
  deprecated: "yellow",
  unnecessary: "blue",
};

export const stylish: Reporter = (results) => {
  const lines: string[] = [];

  for (const { file, findings } of results) {
    if (findings.length === 0) continue;
    lines.push(styleText("underline", file));

    // Align the position and severity columns within each file.
    const positions = findings.map((f) => (f.loc ? `${f.loc.line}:${f.loc.col}` : "-"));
    const posWidth = Math.max(...positions.map((p) => p.length));
    const sevWidth = Math.max(...findings.map((f) => f.severity.length));

    findings.forEach((finding, i) => {
      const position = (positions[i] ?? "-").padStart(posWidth);
      const severity = finding.severity.padEnd(sevWidth);
      const label = finding.possible ? `${severity} (possible)` : severity;
      lines.push(
        `  ${styleText("dim", position)}  ` +
          `${styleText(SEVERITY_COLOUR[finding.severity], label)}  ` +
          `${styleText("bold", finding.ruleId)}`,
      );
      const indent = " ".repeat(posWidth + 4);
      lines.push(`${indent}${finding.message}`);
      if (finding.detail !== undefined) {
        lines.push(`${indent}${styleText("dim", finding.detail)}`);
      }
      lines.push(`${indent}${styleText("green", "→")} ${finding.replacement}`);
      lines.push(`${indent}${styleText("dim", finding.url)}`);
    });

    lines.push("");
  }

  const count = total(results);
  if (count === 0) {
    return `${styleText("green", "✓")} no findings\n`;
  }

  const counts = tally(results);
  const breakdown = (["harmful", "deprecated", "unnecessary"] as const)
    .filter((severity) => counts[severity] > 0)
    .map((severity) => `${counts[severity]} ${severity}`)
    .join(", ");

  lines.push(
    styleText("red", `✖ ${count} finding${count === 1 ? "" : "s"}`) + ` (${breakdown})`,
  );
  return `${lines.join("\n")}\n`;
};
