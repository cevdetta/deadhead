import type { MatchFn } from "../../types.ts";
import { hasType, isLdJson, parseLdJson, schemaTerm, someNode } from "../../lib/json-ld.ts";

/** HowTo (2023), SpecialAnnouncement (2025), FAQPage (2026): whole names, so HowToStep stays quiet. */
const RETIRED = schemaTerm(["HowTo", "FAQPage", "SpecialAnnouncement"]);

/** Microdata alternatives are decided by the selector; a JSON-LD block is parsed and walked. */
export const match: MatchFn = (element) => {
  if (!isLdJson(element)) return true;
  const parsed = parseLdJson(element);
  return parsed.ok && someNode(parsed.value, (node) => hasType(node, RETIRED));
};
