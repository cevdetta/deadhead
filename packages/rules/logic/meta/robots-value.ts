import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * The valid robots directive names, lowercased, from Google's valid-rules
 * table. Historical names (`noarchive`, `nocache`, `nositelinkssearchbox`)
 * and retired vendor names (`noodp`, `noydir`) are absent on purpose:
 * Google ignores them, so they trip the rule like any other unknown token.
 */
const VALID_NAMES: ReadonlySet<string> = new Set([
  "all",
  "index",
  "follow",
  "noindex",
  "nofollow",
  "none",
  "nosnippet",
  "indexifembedded",
  "noimageindex",
  "notranslate",
  "max-snippet",
  "max-image-preview",
  "max-video-preview",
  "unavailable_after",
]);

/** Names that need a value; a bare one is ignored by Google, so it trips. */
const PARAMETRIZED: ReadonlySet<string> = new Set([
  "max-snippet",
  "max-image-preview",
  "max-video-preview",
  "unavailable_after",
]);

/** Integers, with the -1 Google documents for unlimited. */
const INTEGER = /^-?\d+$/;

const paramOk = (name: string, value: string): boolean => {
  switch (name) {
    case "max-snippet":
    case "max-video-preview":
      return INTEGER.test(value);
    case "max-image-preview":
      return value === "none" || value === "standard" || value === "large";
    case "unavailable_after":
      return value !== "";
    default:
      return false;
  }
};

/**
 * Google's list form is comma-separated, and a parameter reads `name: value`
 * with optional spaces around the colon. A value can hold spaces itself
 * (`unavailable_after: 25 Jun 2010 15:00:00 PST`), so an item is split on its
 * first colon and never on whitespace. An item without a colon may still hold
 * several bare names separated by spaces (`noindex nofollow`).
 */
const WHITESPACE = /[\t\n\f\r ]+/;

/** The name an item opens with: everything before its first colon or space. */
const leadingName = (item: string): string =>
  stripAsciiWhitespace(item).split(/[:\t\n\f\r ]/, 1)[0] ?? "";

/**
 * Split `content` into items. Google accepts RFC 822 and RFC 850 dates for
 * `unavailable_after` (`Sat, 25 Jun 2010 15:00:00 GMT`), whose own comma
 * would otherwise cut the date in two. The items after an `unavailable_after`
 * item therefore fold back into its value until one opens with a known name.
 */
const items = (content: string): string[] => {
  const out: string[] = [];
  for (const item of content.split(",")) {
    const last = out.at(-1);
    if (last !== undefined && leadingName(last) === "unavailable_after" && !VALID_NAMES.has(leadingName(item))) {
      out[out.length - 1] = `${last},${item}`;
    } else {
      out.push(item);
    }
  }
  return out;
};

/**
 * The `meta[name="robots" i], meta[name="googlebot" i]` selector is only a
 * pre-filter. A tag trips the rule exactly when one of its content tokens
 * falls outside the valid table above: Google ignores such tokens, so a
 * typo voids indexing intent without warning.
 *
 * Tags with no `content` attribute, or with no parseable tokens, stay quiet:
 * there is nothing to judge.
 */
export const match: MatchFn = (element) => {
  const content = element.attr("content");
  if (content === undefined) return false;
  for (const item of items(content.toLowerCase())) {
    const colon = item.indexOf(":");
    if (colon >= 0) {
      const name = stripAsciiWhitespace(item.slice(0, colon));
      const value = stripAsciiWhitespace(item.slice(colon + 1));
      if (!VALID_NAMES.has(name) || !paramOk(name, value)) return true;
      continue;
    }
    for (const token of item.split(WHITESPACE)) {
      if (token === "") continue;
      if (!VALID_NAMES.has(token) || PARAMETRIZED.has(token)) return true;
    }
  }
  return false;
};
