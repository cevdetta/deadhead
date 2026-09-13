import type { CheckFn } from "../../types.ts";

/**
 * Only a link that is purely `apple-touch-icon` counts as the replacement. A
 * single `rel="apple-touch-icon apple-touch-icon-precomposed"` matches both
 * `~=` tests, and removing it would take the page's only touch icon with it.
 */
const PLAIN = 'link[rel~="apple-touch-icon" i]:not([rel~="apple-touch-icon-precomposed" i])';
const PRECOMPOSED = 'link[rel~="apple-touch-icon-precomposed" i]';

/**
 * No selector can express "this element, but only if another one exists", which
 * is what makes this a document rule. A lone precomposed link is the page's only
 * home-screen icon and there is no fix op that renames a token, so it is left
 * alone rather than reported with advice the fixer cannot follow.
 */
export const check: CheckFn = (doc, ctx) => {
  if (doc.querySelector(PLAIN) === null) return [];
  return doc.querySelectorAll(PRECOMPOSED).map((element) => ctx.report(element));
};
