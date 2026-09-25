import type { FixableFn } from "../../types.ts";
import { isUnreferencedSvgChild } from "../../lib/svg.ts";

/**
 * `url(#id)` resolves to the first element with that id, so deleting a
 * `<solidcolor id>` that precedes a real paint server with the same id changes
 * the paint, and every engine names an element with an `id` on `window`.
 * Outside `<svg>` it is an HTML unknown element whose children render.
 * https://www.w3.org/TR/SVG2/painting.html#SpecifyingPaint
 */
export const fixable: FixableFn = isUnreferencedSvgChild;
