import type { MatchFn } from "../../types.ts";

/**
 * The JavaScript MIME type essences, verbatim from the MIME Sniffing Standard.
 * https://mimesniff.spec.whatwg.org/#javascript-mime-type
 *
 * The legacy `javascript1.x`, `jscript` and `livescript` spellings are in the
 * list because the standard keeps them there; they behave identically.
 */
const JAVASCRIPT_MIME_ESSENCES: ReadonlySet<string> = new Set([
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript",
]);

/** ASCII whitespace, as the HTML Standard defines it — not `String#trim`. */
const stripAsciiWhitespace = (value: string): string =>
  value.replace(/^[\t\n\f\r ]+/, "").replace(/[\t\n\f\r ]+$/, "");

/**
 * The `script[type]` selector is only a pre-filter. A type is removable exactly
 * when it is a *JavaScript MIME type essence match*: the trimmed value, compared
 * ASCII case-insensitively against the list above.
 *
 * Parameters deliberately do not count. `type="text/javascript; charset=utf-8"`
 * is not an essence match, which means the browser treats that element as a data
 * block and never executes it — deleting the attribute would start running code
 * that has not run since it was written. Same for a typo like `text/javasript`.
 * Both are real bugs, but they are not *this* rule, and this rule carries a
 * `remove-attribute` fix.
 */
export const match: MatchFn = (element) => {
  const type = element.attr("type");
  if (type === undefined) return false;
  return JAVASCRIPT_MIME_ESSENCES.has(stripAsciiWhitespace(type).toLowerCase());
};
