import type { MatchFn } from "../../types.ts";
import { directiveNames, isCspMeta } from "../../lib/csp.ts";

/**
 * The obsolete mixed-content directive, inside a meta policy.
 * `upgrade-insecure-requests` is its replacement and a distinct name, so only
 * an exact directive name counts, never a prefix.
 */
export const match: MatchFn = (element) => {
  if (!isCspMeta(element)) return false;
  const content = element.attr("content");
  return content !== undefined && directiveNames(content).includes("block-all-mixed-content");
};
