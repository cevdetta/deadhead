import type { MatchFn } from "../../types.ts";

/**
 * Attributes SVG 1.1 defined and SVG 2 removed, lowercased. `zoomAndPan`,
 * `color-rendering`, `requiredExtensions` and `xml:lang` are absent on
 * purpose: SVG 2 still defines them.
 */
const REMOVED: ReadonlySet<string> = new Set([
  "contentscripttype",
  "contentstyletype",
  "externalresourcesrequired",
  "glyph-orientation-horizontal",
  "kerning",
  "requiredfeatures",
  "xml:base",
]);

/**
 * The tag-list selector is a pre-filter of SVG element names.
 */
export const match: MatchFn = (element) => element.attrNames().some((name) => REMOVED.has(name));
