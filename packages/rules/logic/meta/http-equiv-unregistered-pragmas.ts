import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";
import { OWNED_HTTP_EQUIV } from "../../lib/http-equiv.ts";

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

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A tag trips the rule
 * exactly when its value is neither a WHATWG pragma-table keyword nor a
 * value some other rule already owns (`OWNED_HTTP_EQUIV`, `lib/http-equiv.ts`):
 * such a value is no registered pragma, and no other rule reports it. The
 * rule reports without autofixing, since `origin-trial` still enrolls
 * trials in some engines today.
 */
export const match: MatchFn = (element) => {
  const value = element.attr("http-equiv");
  if (value === undefined) return false;
  const normalized = stripAsciiWhitespace(value).toLowerCase();
  return !ALLOWED.has(normalized) && !OWNED_HTTP_EQUIV.has(normalized);
};
