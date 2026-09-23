import type { FixableFn } from "../../types.ts";
import { asciiLowercase, stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * Apple's Safari HTML Reference: the tag takes `default`, `black` or
 * `black-translucent`, and `default` is the status bar a Home Screen app gets
 * with no tag. `black` and `black-translucent` style a surface theme-color
 * does not reach, so only an absent or `default` value is inert.
 * https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html
 */
export const fixable: FixableFn = (element) => {
  const content = element.attr("content");
  return content === undefined || asciiLowercase(stripAsciiWhitespace(content)) === "default";
};
