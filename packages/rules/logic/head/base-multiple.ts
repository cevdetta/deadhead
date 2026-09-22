import type { CheckFn } from "../../types.ts";

/**
 * No selector can count base elements, which is what makes this a
 * `kind: "document"` rule rather than an element rule with a logic refinement.
 *
 * Each `base` past the first reports itself; the first stays quiet. Unlike
 * the charset twin, extras here are not dead at all: the first `href` and
 * the first `target` win as separate races, so the finding carries no fix
 * and consolidation stays a human job.
 */
export const check: CheckFn = (doc, ctx) => {
  const elements = doc.querySelectorAll("base");
  return elements
    .slice(1)
    .map((extra) => ctx.report(extra, { detail: "duplicate base element" }));
};
