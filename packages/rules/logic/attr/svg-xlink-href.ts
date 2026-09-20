import type { MatchFn } from "../../types.ts";

/**
 * The fifteen SVG elements that take `xlink:href`, lowercased to match the
 * port's tag guarantee. MDN lists them on the `xlink:href` page; camelCase
 * spellings (`animateMotion`, `feImage`, `linearGradient`, `radialGradient`,
 * `textPath`) appear here folded, since the selector grammar has no uppercase
 * in tag names either.
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
 * The tag-list selector is only a pre-filter: a colon cannot appear in the
 * selector subset, so no `[xlink:href]` spelling exists. A tag is claimed
 * exactly when it is one of the fifteen elements above and carries the
 * `xlink:href` attribute. All three adapters expose the qualified name, so a
 * plain presence check agrees everywhere.
 */
export const match: MatchFn = (element) => {
  if (!XLINK_ELEMENTS.has(element.tag)) return false;
  return element.hasAttr("xlink:href");
};
