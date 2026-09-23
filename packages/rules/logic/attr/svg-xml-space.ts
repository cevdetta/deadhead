import type { MatchFn } from "../../types.ts";

/**
 * The tag-list selector is a pre-filter of SVG element names. The HTML parser
 * puts `xml:space` in the XML namespace on foreign elements, and every
 * adapter reports the qualified, lowercased name through `attrNames()`, which
 * sidesteps the case-sensitive `getAttribute` a browser applies to SVG.
 */
export const match: MatchFn = (element) => element.attrNames().includes("xml:space");
