import type { FixableFn } from "../../types.ts";
import { asciiLowercase } from "../../lib/text.ts";

/**
 * `previous` still has readers. HTML has user agents treat it like `prev`, a
 * link other search engines may read. The op deletes every keyword the
 * selector tests, so a `rel` holding `previous` keeps all of them, and a
 * person rewrites it as `prev`.
 * https://html.spec.whatwg.org/multipage/links.html#linkTypes
 */
export const fixable: FixableFn = (element) => {
  const tokens = asciiLowercase(element.attr("rel") ?? "").split(/[\t\n\f\r ]+/);
  return !tokens.includes("previous");
};
