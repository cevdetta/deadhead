import type { MatchFn } from "../../types.ts";

/**
 * The tag-list selector already names the fifteen SVG elements that take
 * `xlink:href`; a colon cannot appear in the selector subset, so no
 * `[xlink:href]` spelling exists, but the tag list stands in for it. All
 * three adapters expose the qualified name, so a plain presence check agrees
 * everywhere.
 */
export const match: MatchFn = (element) => element.hasAttr("xlink:href");
