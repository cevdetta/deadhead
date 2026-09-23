import type { MatchFn } from "../../types.ts";

/**
 * The schema.org types behind rich results Google Search retired: HowTo
 * (2023), SpecialAnnouncement (2025) and FAQPage (2026). Matched as whole
 * names, bare, `schema:`-prefixed or as a full IRI, so `HowToStep` and
 * `HowToSection` inside a Recipe stay quiet.
 */
const RETIRED = /^(?:schema:|https?:\/\/schema\.org\/)?(?:HowTo|FAQPage|SpecialAnnouncement)$/;

const isRetired = (node: Record<string, unknown>): boolean => {
  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.some((t) => typeof t === "string" && RETIRED.test(t));
};

/** Walks every object and array, `@graph` included, for a retired type. */
const holdsRetired = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(holdsRetired);
  if (value === null || typeof value !== "object") return false;
  const node = value as Record<string, unknown>;
  return isRetired(node) || Object.values(node).some(holdsRetired);
};

/**
 * Four selector alternatives reach this function. The three Microdata
 * `itemtype` branches are decided by the selector. A JSON-LD block is parsed
 * and walked; a block that fails `JSON.parse` is `script/json-ld-syntax`'s
 * finding, never this one's.
 */
export const match: MatchFn = (element) => {
  if (element.tag !== "script" || element.attr("type")?.toLowerCase() !== "application/ld+json") {
    return true;
  }
  try {
    return holdsRetired(JSON.parse(element.text()));
  } catch {
    return false;
  }
};
