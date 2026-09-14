import type { MatchFn } from "../../types.ts";

/**
 * The two client-hint keywords usable (in Chromium only) as pragma directives.
 *
 * WHATWG defines no such pragma — the seven-keyword table has neither value —
 * while Chromium implements both and the WICG client-hints-infrastructure
 * draft defines only the `delegate-ch` meta form, hedged with conditions
 * (no-op after any script/link/style, secure top-level only, never touches
 * the Accept-CH cache). There is no meta-required case: the headers apply
 * earlier and persist, so the header is strictly better.
 */
const CLIENT_HINT_PRAGMAS: ReadonlySet<string> = new Set([
  "accept-ch",
  "delegate-ch",
]);

/** ASCII whitespace, as the HTML Standard defines it — not `String#trim`. */
const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A pragma is a
 * client-hint opt-in exactly when its value, stripped and compared ASCII
 * case-insensitively, is one of the two keywords above.
 */
export const match: MatchFn = (element) => {
  const httpEquiv = element.attr("http-equiv");
  if (httpEquiv === undefined) return false;
  return CLIENT_HINT_PRAGMAS.has(stripAsciiWhitespace(httpEquiv).toLowerCase());
};
