import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * The eight policies, lowercased, plus the three legacy spellings the
 * roadmap keeps silent (`never`, `always`, `default`). The fetched specs
 * enumerate the eight alone; the legacy trio rests on the maintainer's
 * decision, recorded in the rule doc.
 */
const VALID: ReadonlySet<string> = new Set([
  "no-referrer",
  "no-referrer-when-downgrade",
  "same-origin",
  "origin",
  "strict-origin",
  "origin-when-cross-origin",
  "strict-origin-when-cross-origin",
  "unsafe-url",
  "never",
  "always",
  "default",
]);

/**
 * The `meta[name="referrer" i]` selector is only a pre-filter. The field
 * holds a single keyword, so the whole trimmed value has to hit the table
 * above: multi-token and empty values trip like any other unknown token,
 * since browsers honor none of them.
 */
export const match: MatchFn = (element) => {
  const content = element.attr("content");
  if (content === undefined) return false;
  return !VALID.has(stripAsciiWhitespace(content).toLowerCase());
};
