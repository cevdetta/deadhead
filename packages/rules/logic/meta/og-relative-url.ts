import type { MatchFn } from "../../types.ts";

/**
 * The Open Graph schema types these properties as `ogc:url`: "a valid URL
 * having the http or https scheme". So the test is the scheme, after trimming
 * ASCII whitespace — `/cover.jpg`, `cover.jpg` and the scheme-less
 * `//cdn.example.com/cover.jpg` all fail it, and so does a missing `content`.
 * https://ogp.me/ns/ogp.me.ttl
 *
 * Whether the rest of the value is a well-formed URL is deliberately not
 * checked: the rule is about values a scraper has no base to resolve.
 */
const ABSOLUTE_HTTP = /^[\t\n\f\r ]*https?:\/\//i;

export const match: MatchFn = (element) => {
  const content = element.attr("content");
  return content === undefined || !ABSOLUTE_HTTP.test(content);
};
