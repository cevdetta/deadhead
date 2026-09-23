import type { MatchFn } from "../../types.ts";
import { hasType, isLdJson, parseLdJson, schemaTerm, someNode } from "../../lib/json-ld.ts";

const SEARCH_ACTION = schemaTerm(["SearchAction"]);
const POTENTIAL_ACTION = schemaTerm(["potentialAction"]);

/** A `potentialAction` value holding a SearchAction: the sitelinks search box pattern. */
const holdsSearchBox = (node: Record<string, unknown>): boolean =>
  Object.entries(node).some(
    ([key, child]) =>
      POTENTIAL_ACTION.test(key) && (Array.isArray(child) ? child : [child]).some((a) => hasType(a, SEARCH_ACTION)),
  );

export const match: MatchFn = (element) => {
  if (!isLdJson(element)) return true;
  const parsed = parseLdJson(element);
  return parsed.ok && someNode(parsed.value, holdsSearchBox);
};
