import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * The DNS prefetch-control pragma, minus its one working value.
 *
 * WHATWG defines no such pragma (the request sits open as whatwg/html#6196)
 * while Chromium implements it, so this is browser-convention territory.
 * `content="on"` restates the default and empty/garbage values do nothing;
 * only `off` opts out — a documented privacy choice this rule never reports.
 *
 * `off` stays silent deliberately: reporting it would need `fix: none` and a
 * problem statement that does not exist. Possible follow-up, not this rule.
 */
const OPT_OUT: string = "off";

/**
 * The `meta[http-equiv="x-dns-prefetch-control" i]` selector is only a
 * pre-filter. A pragma is reported exactly when its content is absent or is
 * anything but `off`, compared ASCII case-insensitively: every reported value
 * is dead weight, and the one value that opts anywhere is left alone.
 */
export const match: MatchFn = (element) => {
  const httpEquiv = element.attr("http-equiv");
  if (httpEquiv === undefined) return false;
  if (stripAsciiWhitespace(httpEquiv).toLowerCase() !== "x-dns-prefetch-control") return false;
  const content = element.attr("content");
  if (content === undefined) return true;
  return stripAsciiWhitespace(content).toLowerCase() !== OPT_OUT;
};
