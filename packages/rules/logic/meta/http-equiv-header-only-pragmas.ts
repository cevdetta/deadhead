import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";
import { HEADER_ONLY } from "../../lib/http-equiv.ts";

/**
 * Security and CORS headers that browsers only honour as HTTP response
 * headers. None of them is an HTML pragma-table keyword, so in http-equiv
 * they all map to no state and do nothing while looking like protection.
 *
 * The set itself lives in `lib/http-equiv.ts`, shared with
 * `meta/http-equiv-unregistered-pragmas` so the two cannot drift.
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
 * - feature-policy: the retired name of Permissions-Policy (renamed 26 May
 *   2020, https://developer.chrome.com/blog/feature-policy); the HTML
 *   pragma table never listed either name, so removal is inert.
 */

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
