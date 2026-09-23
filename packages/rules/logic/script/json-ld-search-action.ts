import type { MatchFn } from "../../types.ts";

/** A schema.org term as JSON-LD spells it: bare, `schema:`-prefixed or a full IRI. */
const schemaTerm = (name: string): RegExp =>
  new RegExp(`^(?:schema:|https?://schema\\.org/)?${name}$`);

const SEARCH_ACTION = schemaTerm("SearchAction");
const POTENTIAL_ACTION = schemaTerm("potentialAction");

const isSearchAction = (node: unknown): boolean => {
  if (node === null || typeof node !== "object" || Array.isArray(node)) return false;
  const type: unknown = (node as Record<string, unknown>)["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some((t) => typeof t === "string" && SEARCH_ACTION.test(t));
};

/** Walks every object and array, `@graph` included, for a `potentialAction` holding a SearchAction. */
const holdsSearchAction = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(holdsSearchAction);
  if (value === null || typeof value !== "object") return false;
  return Object.entries(value).some(([key, child]) => {
    if (POTENTIAL_ACTION.test(key)) {
      const actions = Array.isArray(child) ? child : [child];
      if (actions.some(isSearchAction)) return true;
    }
    return holdsSearchAction(child);
  });
};

/**
 * Two selector alternatives reach this function. A microdata item typed
 * `schema.org/SearchAction` in a `potentialAction` slot is decided by the
 * selector alone. A JSON-LD block is parsed and walked.
 *
 * A `SearchAction` outside `potentialAction` describes a search, not the
 * sitelinks search box, and stays quiet. A block that fails `JSON.parse` is
 * `script/json-ld-syntax`'s finding, never this one's.
 */
export const match: MatchFn = (element) => {
  if (element.tag !== "script" || element.attr("type")?.toLowerCase() !== "application/ld+json") {
    return true;
  }
  try {
    return holdsSearchAction(JSON.parse(element.text()));
  } catch {
    return false;
  }
};
