import type { ElementPort } from "../types.ts";

/**
 * An element inside `<svg>` with no `id`: nothing can reference it through
 * `url(#…)` or reach it by name on `window`, and the SVG parser owns it, so
 * it is never an HTML unknown element whose children render. Outside `<svg>`,
 * the same tag is an HTML unknown element and its content shows.
 */
export const isUnreferencedSvgChild = (element: ElementPort): boolean => {
  if (element.hasAttr("id")) return false;
  for (let node = element.parent(); node !== null; node = node.parent()) {
    if (node.tag === "svg") return true;
  }
  return false;
};
