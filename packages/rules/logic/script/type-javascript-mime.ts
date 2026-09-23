import type { MatchFn } from "../../types.ts";
import { isJavaScriptMimeEssence } from "../../lib/script.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * The `script[type]` selector is only a pre-filter. A type is removable exactly
 * when it is a *JavaScript MIME type essence match*: the trimmed value, compared
 * ASCII case-insensitively against the MIME Sniffing Standard's list.
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
  return isJavaScriptMimeEssence(stripAsciiWhitespace(type));
};
