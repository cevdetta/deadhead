/**
 * SARIF 2.1.0, which is what buys GitHub code-scanning annotations: upload
 * this and findings appear inline on the pull request diff.
 *
 * The `rules` array is populated from the findings actually produced rather
 * than from the whole catalogue, so the report stays proportional to what was
 * found. `helpUri` is the rule's documentation page — the same link the
 * stylish reporter prints.
 */

import type { Severity } from "../../core/vocabulary.ts";
import type { Reporter } from "./index.ts";

/** SARIF has three useful levels; the severity ladder maps onto them directly. */
const LEVEL: Record<Severity, string> = {
  harmful: "error",
  deprecated: "warning",
  unnecessary: "note",
};

export const sarif: Reporter = (results) => {
  const rules = new Map<string, Record<string, unknown>>();
  const sarifResults: Record<string, unknown>[] = [];

  for (const { file, findings } of results) {
    for (const finding of findings) {
      if (!rules.has(finding.ruleId)) {
        rules.set(finding.ruleId, {
          id: finding.ruleId,
          name: finding.ruleId,
          shortDescription: { text: finding.message },
          fullDescription: { text: `${finding.message} ${finding.replacement}` },
          helpUri: finding.url,
          defaultConfiguration: { level: LEVEL[finding.severity] },
        });
      }

      const region: Record<string, number> = {};
      if (finding.loc !== null) {
        region["startLine"] = finding.loc.line;
        region["startColumn"] = finding.loc.col;
      }
      if (finding.range !== null) {
        region["charOffset"] = finding.range[0];
        region["charLength"] = finding.range[1] - finding.range[0];
      }

      sarifResults.push({
        ruleId: finding.ruleId,
        level: LEVEL[finding.severity],
        message: {
          text: finding.detail === undefined
            ? finding.message
            : `${finding.message} (${finding.detail})`,
        },
        locations: [
          {
            physicalLocation: {
              // SARIF wants POSIX-style relative URIs.
              artifactLocation: { uri: file.split("\\").join("/") },
              ...(Object.keys(region).length > 0 ? { region } : {}),
            },
          },
        ],
      });
    }
  }

  return `${JSON.stringify(
    {
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      version: "2.1.0",
      runs: [
        {
          tool: {
            driver: {
              name: "deadhead",
              informationUri: "https://deadhead.dev",
              rules: [...rules.values()],
            },
          },
          results: sarifResults,
        },
      ],
    },
    null,
    2,
  )}\n`;
};
