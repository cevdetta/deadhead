import type { MatchFn } from "../../types.ts";

/**
 * The obsolete mixed-content directive, inside a meta policy.
 *
 * CSP is a `;`-separated list of directives. The directive name is the first
 * token of each part, compared ASCII case-insensitively.
 * `block-all-mixed-content` is one such name; `upgrade-insecure-requests` is
 * its replacement and a distinct name, so a substring test would misfire
 * against URL paths that hold the string.
 *
 * `content` holds the serialized policy. A missing or empty `content` holds
 * no directive and never trips the rule.
 */
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
 * `content-security-policy` and one `;` part of its `content` names
 * `block-all-mixed-content`. Anything else — including a policy that lists
 * `upgrade-insecure-requests` alone — is left alone.
 */
export const match: MatchFn = (element) => {
  const httpEquiv = element.attr("http-equiv");
  if (httpEquiv === undefined) return false;
  if (stripAsciiWhitespace(httpEquiv).toLowerCase() !== "content-security-policy") return false;
  const content = element.attr("content");
  if (content === undefined) return false;
  return content.split(";").some((part) => directiveName(part) === "block-all-mixed-content");
};
