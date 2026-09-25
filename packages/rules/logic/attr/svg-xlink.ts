import type { MatchFn } from "../../types.ts";

/**
 * Every XLink attribute SVG 2 retired: `xlink:href`, deprecated for plain
 * `href`; the five it removed (`xlink:type`, `xlink:role`, `xlink:arcrole`,
 * `xlink:show`, `xlink:actuate`); and `xlink:title`, deprecated for a child
 * `<title>`.
 * https://www.w3.org/TR/SVG2/linking.html
 * https://www.w3.org/TR/SVG2/changes.html#linking
 */
const XLINK_NAMES = [
  "xlink:href",
  "xlink:type",
  "xlink:role",
  "xlink:arcrole",
  "xlink:show",
  "xlink:actuate",
  "xlink:title",
] as const;

/**
 * The tag-list selector already names the fifteen SVG elements that take
 * these attributes; a colon cannot appear in the selector subset, so no
 * `[xlink:href]` spelling exists, but the tag list stands in for it. The HTML
 * parser puts all seven attributes in the XLink namespace on foreign
 * elements, and all three adapters expose the qualified name, so a plain
 * presence check agrees everywhere.
 */
export const match: MatchFn = (element) => XLINK_NAMES.some((name) => element.hasAttr(name));
