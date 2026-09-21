import type { MatchFn } from "../../types.ts";

/**
 * The WHATWG pragma keywords, and nothing else.
 *
 * `origin-trial` stays out on purpose: Chromium and Firefox enroll trials
 * from the tag, but it has no spec entry, so the rule reports it and leaves
 * the edit to the author (fix: none).
 *
 * Compared ASCII case-insensitively, as an enumerated attribute demands.
 */
const ALLOWED: ReadonlySet<string> = new Set([
  "content-language",
  "content-type",
  "default-style",
  "refresh",
  "set-cookie",
  "x-ua-compatible",
  "content-security-policy",
]);

/** ASCII whitespace, as the HTML Standard defines it — not `String#trim`. */
const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A tag trips the rule
 * exactly when its value falls outside the allowlist above: such a value is
 * no registered pragma keyword. The rule reports without autofixing, since
 * `origin-trial` still enrolls trials in some engines today.
 */
export const match: MatchFn = (element) => {
  const value = element.attr("http-equiv");
  if (value === undefined) return false;
  return !ALLOWED.has(stripAsciiWhitespace(value).toLowerCase());
};
