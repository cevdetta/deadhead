import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";
import { CLIENT_HINT_PRAGMAS } from "../../lib/http-equiv.ts";

/**
 * The two client-hint keywords usable (in Chromium only) as pragma directives.
 *
 * WHATWG defines no such pragma — the seven-keyword table has neither value —
 * while Chromium implements both and the WICG client-hints-infrastructure
 * draft defines only the `delegate-ch` meta form, hedged with conditions
 * (no-op after any script/link/style, secure top-level only, never touches
 * the Accept-CH cache). There is no meta-required case: the headers apply
 * earlier and persist, so the header is strictly better.
 *
 * The set itself lives in `lib/http-equiv.ts`, shared with
 * `meta/http-equiv-unregistered-pragmas` so the two cannot drift.
 */

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
