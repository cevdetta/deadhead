import type { MatchFn } from "../../types.ts";

/**
 * The fifteen SVG elements that take `xlink:href`, the same list as
 * `attr/svg-xlink-href`, lowercased to match the port's tag guarantee.
 */
const XLINK_ELEMENTS: ReadonlySet<string> = new Set([
  "a",
  "animate",
  "animatemotion",
  "animatetransform",
  "feimage",
  "filter",
  "image",
  "lineargradient",
  "mpath",
  "pattern",
  "radialgradient",
  "script",
  "set",
  "textpath",
  "use",
]);

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
 * The tag-list selector is only a pre-filter: a colon cannot appear in the
 * selector subset. The HTML parser puts all six attributes in the XLink
 * namespace on foreign elements, and every adapter reports the qualified name,
 * so a plain presence check agrees everywhere.
 */
export const match: MatchFn = (element) =>
  XLINK_ELEMENTS.has(element.tag) && XLINK_REMOVED.some((name) => element.hasAttr(name));
