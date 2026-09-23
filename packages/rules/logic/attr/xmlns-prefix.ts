import type { MatchFn } from "../../types.ts";

/**
 * A colon cannot appear in the selector subset, so the selector is a tag list
 * of the elements that carry prefix declarations in practice (`<html>` for
 * `og:` and `fb:`, a breadcrumb container for `v:`, inline `<svg>` for editor
 * namespaces) and this function decides.
 *
 * `xmlns:xlink` is exempt: the HTML syntax expresses it on foreign elements,
 * SVG 2 governs it, and a standalone copy of the SVG still needs it while it
 * uses `xlink:href`. `attr/svg-xlink-href` covers that usage. All three
 * adapters report the qualified, lowercased name.
 */
export const match: MatchFn = (element) =>
  element.attrNames().some((name) => name.startsWith("xmlns:") && name !== "xmlns:xlink");
