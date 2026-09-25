import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";
import { CACHE_KEYWORDS } from "../../lib/http-equiv.ts";

/**
 * Cache-related values that are not HTML pragma-table keywords, so in
 * http-equiv they map to no state. HTTP caching (RFC 9111) is driven by
 * response header fields; no browser or common proxy reads cache pragmas
 * out of markup.
 *
 * The set itself lives in `lib/http-equiv.ts`, shared with
 * `meta/http-equiv-unregistered-pragmas` so the two cannot drift.
 */

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A tag is claimed
 * exactly when its trimmed http-equiv value, compared ASCII
 * case-insensitively, is one of the cache keywords above.
 */
export const match: MatchFn = (element) => {
  const value = element.attr("http-equiv");
  if (value === undefined) return false;
  return CACHE_KEYWORDS.has(stripAsciiWhitespace(value).toLowerCase());
};
