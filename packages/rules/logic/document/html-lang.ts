import type { MatchFn } from "../../types.ts";

/** Only ASCII whitespace, as the HTML Standard defines it — the ACT rule's "empty". */
const BLANK = /^[\t\n\f\r ]*$/;

/**
 * The `html` selector finds the document element; this decides.
 *
 * - A `lang` that is absent, empty or only whitespace leaves the language
 *   unknown. That is the W3C ACT rule's expectation, and the whitespace case is
 *   why this is logic rather than `html:not([lang]), html[lang=""]`. `xml:lang`
 *   on its own does not count.
 * - It follows the "missing" pattern from `head/viewport-missing`: nothing is reported
 *   unless there is a `<head>` with at least one element. parse5 wraps a
 *   fragment or partial in an implied `<html>` that never had a `lang` to give,
 *   and the html-eslint AST has no `html` element for it at all.
 */
export const match: MatchFn = (element) => {
  const lang = element.attr("lang");
  if (lang !== undefined && !BLANK.test(lang)) return false;
  const head = element.children().find((child) => child.tag === "head");
  return head !== undefined && head.children().length > 0;
};
