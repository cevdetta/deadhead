import type { FixableFn } from "../../types.ts";
import { isUnreferencedSvgChild } from "../../lib/svg.ts";

/**
 * Safari builds before WebKit 309308@main (2026-03-16) resolve
 * `cursor: url(#id)` to a `<cursor>` element's href, and every engine names an
 * element with an `id` on `window`, so a `<cursor>` with an `id` is vetoed.
 * Outside `<svg>` it is an HTML unknown element whose children render.
 * https://github.com/WebKit/WebKit/commit/230771c93ca1c72406ef0a93bd5709af34f05525
 */
export const fixable: FixableFn = isUnreferencedSvgChild;
