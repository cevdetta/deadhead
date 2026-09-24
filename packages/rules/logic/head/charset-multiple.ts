import type { CheckFn } from "../../types.ts";

/**
 * No selector can count charset declarations, which is what makes this a
 * `kind: "document"` rule rather than an element rule with a logic refinement.
 *
 * Each `meta[charset]` past the first reports itself; the first stays quiet
 * as the honored survivor. A document with one or zero declarations reports
 * nothing.
 */
export const check: CheckFn = (doc, ctx) => {
  const declarations = doc.querySelectorAll("meta[charset]");
  return declarations
    .slice(1)
    .map((extra) => ctx.report(extra, { detail: "duplicate charset declaration" }));
};
