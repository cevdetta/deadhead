import type { MatchFn } from "../../types.ts";

/**
 * The `style[type]` selector is a pre-filter. A type is removable exactly
 * when it is an ASCII case-insensitive match for `text/css`, the sole
 * warning-level value in WHATWG section 16.1.1.
 *
 * No trim, no parameter pass. `TEXT/CSS` matches and deletes safe, while
 * `text/css; charset=utf-8` does not match: the browser reads that element
 * as a data block and never applies it, so deletion would start application
 * of CSS that never applied. Same for a typo like `text/cs` and for empty,
 * which the warning set leaves outside. The guard mirrors sibling
 * `attr/script-type-javascript`, which skips parameter types for the same
 * safe-fix reason.
 */
export const match: MatchFn = (element) => {
  const type = element.attr("type");
  if (type === undefined) return false;
  return type.toLowerCase() === "text/css";
};
