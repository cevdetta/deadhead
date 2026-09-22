import type { CheckFn } from "../../types.ts";

/** ASCII whitespace, as the HTML Standard defines it — not `String#trim`. */
const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/**
 * No selector can count head titles, which is what makes this a
 * `kind: "document"` rule rather than an element rule with a logic refinement.
 *
 * Three cases, one finding each: a head with no `title` reports the `head`
 * itself (there is no element to point at); each `title` past the first
 * reports itself; a `title` with `whitespace-only` text reports itself.
 * A document with no `head` at all reports nothing.
 */
export const check: CheckFn = (doc, ctx) => {
  const titles = doc.querySelectorAll("title");
  if (titles.length === 0) {
    const head = doc.querySelector("head");
    if (head === null) return [];
    return [ctx.report(head, { detail: "head has no title element" })];
  }
  const findings = [];
  for (const extra of titles.slice(1)) {
    findings.push(ctx.report(extra, { detail: "duplicate title element" }));
  }
  for (const title of titles) {
    if (stripAsciiWhitespace(title.text()) === "") {
      findings.push(ctx.report(title, { detail: "empty title element" }));
    }
  }
  return findings;
};
