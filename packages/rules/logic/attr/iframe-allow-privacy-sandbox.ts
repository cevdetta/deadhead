import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * The `iframe[allow]` selector is only a pre-filter. An `allow` value holds
 * `;`-separated directives, each naming its feature in the first token, so
 * the verdict depends on whether one names a retired Privacy Sandbox
 * feature: `browsing-topics` or `interest-cohort` for Topics,
 * `attribution-reporting` for Attribution Reporting. The comparison folds
 * ASCII case; a URL path that holds a name never counts, since only the
 * first token of each part is read.
 *
 * There is no autofix: the fault sits inside one `;` part of the value,
 * which no fix op edits.
 */
const RETIRED = new Set(["browsing-topics", "interest-cohort", "attribution-reporting"]);

export const match: MatchFn = (element) => {
  const allow = element.attr("allow");
  if (allow === undefined) return false;
  for (const part of allow.split(";")) {
    const trimmed = stripAsciiWhitespace(part);
    if (trimmed === "") continue;
    const end = trimmed.search(/[\t\n\f\r ]/);
    const name = (end === -1 ? trimmed : trimmed.slice(0, end)).toLowerCase();
    if (RETIRED.has(name)) return true;
  }
  return false;
};
