import type { MatchFn } from "../../types.ts";

/**
 * The five XLink attributes SVG 2 removed, plus `xlink:title`, which it
 * deprecated for a child `<title>`. `xlink:href` has its own rule.
 */
const XLINK_REMOVED = [
  "xlink:type",
  "xlink:role",
  "xlink:arcrole",
  "xlink:show",
  "xlink:actuate",
  "xlink:title",
] as const;

/**
 * The tag-list selector already names the fifteen SVG elements that take
 * these attributes, the same list as `attr/svg-xlink-href`; a colon cannot
 * appear in the selector subset. The HTML parser puts all six attributes in
 * the XLink namespace on foreign elements, and every adapter reports the
 * qualified name, so a plain presence check agrees everywhere.
 */
export const match: MatchFn = (element) => XLINK_REMOVED.some((name) => element.hasAttr(name));
