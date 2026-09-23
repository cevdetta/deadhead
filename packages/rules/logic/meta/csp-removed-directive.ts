import type { MatchFn } from "../../types.ts";
import { directiveNames, isCspMeta } from "../../lib/csp.ts";

/**
 * Directives that a CSP document once defined and the current CSP3 draft does
 * not: `referrer` and `reflected-xss` (CSP 1.1), `plugin-types` (CSP2),
 * `navigate-to` and `prefetch-src` (CSP3 drafts).
 *
 * CSP is a `;`-separated list of directives. The directive name is the first
 * token of each part, compared ASCII case-insensitively, so a directive
 * *value* that holds one of these strings (a URL path, say) never trips the
 * rule.
 */
const REMOVED: ReadonlySet<string> = new Set([
  "navigate-to",
  "plugin-types",
  "prefetch-src",
  "referrer",
  "reflected-xss",
]);

/**
 * The `meta[http-equiv="content-security-policy" i]` selector is only a
 * pre-filter. A tag is claimed exactly when its `http-equiv` trims to
 * `content-security-policy` and one `;` part of its `content` names a removed
 * directive.
 */
export const match: MatchFn = (element) => {
  if (!isCspMeta(element)) return false;
  const content = element.attr("content");
  return content !== undefined && directiveNames(content).some((name) => REMOVED.has(name));
};
