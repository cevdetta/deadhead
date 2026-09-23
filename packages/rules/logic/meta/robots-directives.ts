import type { MatchFn } from "../../types.ts";

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
  for (const item of content.toLowerCase().split(",")) {
    const colon = item.indexOf(":");
    if (colon >= 0) {
      const name = item.slice(0, colon).trim();
      const value = item.slice(colon + 1).trim();
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
