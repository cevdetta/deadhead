import type { CheckFn } from "../../types.ts";

/**
 * The HTML Standard counts `main` elements "that [do] not have the hidden
 * attribute specified", so `:not([hidden])` is the whole test — including
 * `hidden="until-found"`, which has the attribute. A `main` hidden only by CSS
 * still counts: the markup cannot see it, and `hidden` is the sanctioned way
 * to park an inactive view.
 *
 * Every visible `main` is reported once there are two. Which one holds the
 * page's dominant content is the author's call, not the linter's.
 */
export const check: CheckFn = (doc, ctx) => {
  const visible = doc.querySelectorAll("main:not([hidden])");
  if (visible.length < 2) return [];
  return visible.map((element) =>
    ctx.report(element, { detail: `${visible.length} visible main elements in this document` }),
  );
};
