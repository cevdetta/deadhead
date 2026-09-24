import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * Retired security mechanisms: nothing enforces them anymore, not even as
 * response headers.
 *
 * - x-xss-protection: the reflected-XSS auditor switch (Chrome/Safari/IE
 *   era). MDN marks it deprecated and recommends CSP instead.
 * - x-webkit-csp: Chrome 14 / Safari 6 era prefixed CSP.
 * - x-content-security-policy: Firefox 4–22 era prefixed CSP, with a
 *   different directive vocabulary (`allow` instead of `default-src`).
 * Modern browsers take only the unprefixed Content-Security-Policy header.
 */
const RETIRED_SECURITY: ReadonlySet<string> = new Set([
  "x-xss-protection",
  "x-webkit-csp",
  "x-content-security-policy",
]);

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A tag is claimed
 * exactly when its trimmed http-equiv value, compared ASCII
 * case-insensitively, is one of the retired keywords above.
 */
export const match: MatchFn = (element) => {
  const value = element.attr("http-equiv");
  if (value === undefined) return false;
  return RETIRED_SECURITY.has(stripAsciiWhitespace(value).toLowerCase());
};
