import type { MatchFn } from "../../types.ts";

/** ASCII whitespace, as the HTML Standard defines it. */
const WHITESPACE = "\\t\\n\\f\\r ";

/**
 * `content` is a list of `key=value` pairs. Comma is the documented separator,
 * semicolon has been accepted by some engines, and Chromium also splits on
 * whitespace — so all three separate pairs, and whitespace around `=` is folded
 * away first so `user-scalable = no` still reads as one pair. Keys compare
 * case-insensitively and, as in Chromium, a later pair overrides an earlier one.
 * https://drafts.csswg.org/css-viewport/
 */
const parseViewport = (content: string): Map<string, string> => {
  const pairs = new Map<string, string>();
  const folded = content.replace(new RegExp(`[${WHITESPACE}]*=[${WHITESPACE}]*`, "g"), "=");
  for (const token of folded.split(new RegExp(`[${WHITESPACE},;]+`))) {
    const eq = token.indexOf("=");
    if (eq <= 0) continue;
    pairs.set(token.slice(0, eq).toLowerCase(), token.slice(eq + 1));
  }
  return pairs;
};

/** The leading number, as `strtod` reads it; `NaN` when there is none. */
const leadingNumber = (value: string): number => {
  const found = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i.exec(value);
  return found === null ? Number.NaN : Number(found[0]);
};

/**
 * Chromium's `ParseViewportValueAsUserZoom`: `yes`, `device-width`,
 * `device-height` and numbers with |n| >= 1 allow zoom. `no`, numbers between
 * -1 and 1, and anything unrecognised (`false`, an empty value) disable it.
 */
const disablesUserZoom = (value: string): boolean => {
  const keyword = value.toLowerCase();
  if (keyword === "yes" || keyword === "device-width" || keyword === "device-height") return false;
  if (keyword === "no") return true;
  const number = leadingNumber(value);
  return Number.isNaN(number) || Math.abs(number) < 1;
};

/**
 * Chromium's `ParseViewportValueAsZoom`: `yes` is 1, `no` is 0, `device-width`
 * and `device-height` are 10, and a negative number means `auto`. Below 2 caps
 * zoom under the 200% WCAG 1.4.4 asks for.
 *
 * An unrecognised word is deliberately not reported. Chromium reads it as 0,
 * but this rule is `harmful` and should only fire on a value that plainly says
 * "no further zoom".
 */
const capsZoomBelow200 = (value: string): boolean => {
  const keyword = value.toLowerCase();
  if (keyword === "yes" || keyword === "no") return true;
  const number = leadingNumber(value);
  return !Number.isNaN(number) && number >= 0 && number < 2;
};

/**
 * The selector finds every viewport; this decides whether it takes zoom away.
 * There is no fix: the problem is one pair inside `content`, and deleting the
 * element would break the mobile layout the rest of the value sets up.
 */
export const match: MatchFn = (element) => {
  const content = element.attr("content");
  if (content === undefined) return false;
  const pairs = parseViewport(content);
  const userScalable = pairs.get("user-scalable");
  const maximumScale = pairs.get("maximum-scale");
  return (
    (userScalable !== undefined && disablesUserZoom(userScalable)) ||
    (maximumScale !== undefined && capsZoomBelow200(maximumScale))
  );
};
