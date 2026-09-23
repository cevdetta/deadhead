import type { MatchFn } from "../../types.ts";
import { directiveNames, isCspMeta } from "../../lib/csp.ts";

/**
 * The deprecated CSP reporting directive, inside a meta policy. `report-to`
 * is its replacement and a distinct name, so only an exact directive name
 * counts, never a prefix.
 */
export const match: MatchFn = (element) => {
  if (!isCspMeta(element)) return false;
  const content = element.attr("content");
  return content !== undefined && directiveNames(content).includes("report-uri");
};
