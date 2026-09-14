import type { MatchFn } from "../../types.ts";

/**
 * Cache-related values that are not HTML pragma-table keywords, so in
 * http-equiv they map to no state. HTTP caching (RFC 9111) is driven by
 * response header fields; no browser or common proxy reads cache pragmas
 * out of markup.
 */
const CACHE_KEYWORDS: ReadonlySet<string> = new Set([
  "cache-control",
  "pragma",
  "expires",
  "etag",
  "last-modified",
]);

/** ASCII whitespace, as the HTML Standard defines it — not `String#trim`. */
const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

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
