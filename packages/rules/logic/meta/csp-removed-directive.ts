import type { MatchFn } from "../../types.ts";

/**
 * Directives that a CSP document once defined and the current CSP3 draft does
 * not: `referrer` and `reflected-xss` (CSP 1.1), `plugin-types` (CSP2),
 * `navigate-to` and `prefetch-src` (CSP3 drafts).
 *
 * CSP is a `;`-separated list of directives. The directive name is the first
 * token of each part, compared ASCII case-insensitively, so a directive
 * *value* that holds one of these strings (a URL path, say) never trips the
 * rule. The helpers repeat those of `meta/csp-report-uri`: logic modules pair
 * one-to-one with rule docs, so a shared helper has no home here.
 */
const REMOVED: ReadonlySet<string> = new Set([
  "navigate-to",
  "plugin-types",
  "prefetch-src",
  "referrer",
  "reflected-xss",
]);

const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/** The directive name of one `;` part, lowercased, or empty where absent. */
const directiveName = (part: string): string => {
  const trimmed = stripAsciiWhitespace(part);
  if (trimmed === "") return "";
  const end = trimmed.search(/[\t\n\f\r ]/);
  return (end === -1 ? trimmed : trimmed.slice(0, end)).toLowerCase();
};

/**
 * The `meta[http-equiv="content-security-policy" i]` selector is only a
 * pre-filter. A tag is claimed exactly when its `http-equiv` trims to
 * `content-security-policy` and one `;` part of its `content` names a removed
 * directive.
 */
export const match: MatchFn = (element) => {
  const httpEquiv = element.attr("http-equiv");
  if (httpEquiv === undefined) return false;
  if (stripAsciiWhitespace(httpEquiv).toLowerCase() !== "content-security-policy") return false;
  const content = element.attr("content");
  if (content === undefined) return false;
  return content.split(";").some((part) => REMOVED.has(directiveName(part)));
};
