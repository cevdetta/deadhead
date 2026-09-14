import type { MatchFn } from "../../types.ts";

/**
 * Security and CORS headers that browsers only honour as HTTP response
 * headers. None of them is an HTML pragma-table keyword, so in http-equiv
 * they all map to no state and do nothing while looking like protection.
 *
 * - x-frame-options: RFC 7034, "explicitly ignored by user agents when
 *   declared with a meta http-equiv tag".
 * - strict-transport-security: RFC 6797 §8.5, "UAs MUST NOT heed".
 * - content-security-policy-report-only: CSP3, "not supported inside a
 *   meta element" (neither are report-uri, frame-ancestors, sandbox).
 * - x-content-type-options: Fetch/MIME-sniffing response-header mechanism.
 * - permissions-policy, access-control-allow-origin: documented HTTP
 *   response headers (ACAO needs server-side Origin logic).
 * - referrer-policy: the in-document form is <meta name="referrer">.
 */
const HEADER_ONLY: ReadonlySet<string> = new Set([
  "x-frame-options",
  "strict-transport-security",
  "content-security-policy-report-only",
  "x-content-type-options",
  "permissions-policy",
  "access-control-allow-origin",
  "referrer-policy",
]);

/** ASCII whitespace, as the HTML Standard defines it — not `String#trim`. */
const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A tag is claimed
 * exactly when its trimmed http-equiv value, compared ASCII
 * case-insensitively, is one of the header-only keywords above. Anything
 * else — including the enforce-mode `content-security-policy` pragma,
 * which genuinely works in meta — is left alone.
 */
export const match: MatchFn = (element) => {
  const value = element.attr("http-equiv");
  if (value === undefined) return false;
  return HEADER_ONLY.has(stripAsciiWhitespace(value).toLowerCase());
};
