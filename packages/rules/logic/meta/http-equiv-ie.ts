import type { MatchFn } from "../../types.ts";

/**
 * Internet Explorer-only http-equiv values. Documented in Microsoft's
 * archived IE developer library; IE 11 ended support on 15 June 2022 and
 * no other browser has ever acted on them.
 *
 * Deliberately absent: `cleartype`. No primary Microsoft source for an
 * http-equiv cleartype switch surfaced — only validator/SEO lore placing
 * it on IE Mobile 6/7-era phones — so it stays unclaimed rather than
 * guessed. If a primary source turns up, add it here.
 */
const IE_ONLY: ReadonlySet<string> = new Set([
  "imagetoolbar",
  "msthemecompatible",
  "page-enter",
  "page-exit",
  "site-enter",
  "site-exit",
]);

/** ASCII whitespace, as the HTML Standard defines it — not `String#trim`. */
const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A tag is claimed
 * exactly when its trimmed http-equiv value, compared ASCII
 * case-insensitively, is one of the IE-only keywords above.
 */
export const match: MatchFn = (element) => {
  const value = element.attr("http-equiv");
  if (value === undefined) return false;
  return IE_ONLY.has(stripAsciiWhitespace(value).toLowerCase());
};
