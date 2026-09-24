import type { FixableFn } from "../../types.ts";
import { asciiLowercase } from "../../lib/text.ts";

/**
 * `self` still has readers. WebSub makes `rel="self"` the HTML discovery of a
 * topic URL; it creates no HTML link. The op deletes every keyword the
 * selector tests, so a `rel` holding `self` keeps all of them.
 * https://www.w3.org/TR/websub/#discovery
 */
export const fixable: FixableFn = (element) => {
  const tokens = asciiLowercase(element.attr("rel") ?? "").split(/[\t\n\f\r ]+/);
  return !tokens.includes("self");
};
