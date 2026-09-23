import type { MatchFn } from "../../types.ts";
import { directiveNames, isCspMeta } from "../../lib/csp.ts";

/**
 * The obsolete mixed-content directive, inside a meta policy. Only a directive
 * name counts: the first token of a `;` part, compared whole, so the string
 * inside a source value (a URL path, say) never matches. Its replacement,
 * `upgrade-insecure-requests`, is a separate directive the rule leaves alone.
 */
export const match: MatchFn = (element) => {
  if (!isCspMeta(element)) return false;
  const content = element.attr("content");
  return content !== undefined && directiveNames(content).includes("block-all-mixed-content");
};
