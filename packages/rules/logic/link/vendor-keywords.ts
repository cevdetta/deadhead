import type { FixableFn } from "../../types.ts";
import { asciiLowercase } from "../../lib/text.ts";

/**
 * `edituri` still has readers. The WordPress apps read `rel="EditURI"` to find
 * a self-hosted site's XML-RPC endpoint; it creates no HTML link. The op
 * deletes every keyword the selector tests, so a `rel` holding `edituri`
 * keeps all of them.
 * https://developer.wordpress.org/reference/functions/rsd_link/
 */
export const fixable: FixableFn = (element) => {
  const tokens = asciiLowercase(element.attr("rel") ?? "").split(/[\t\n\f\r ]+/);
  return !tokens.includes("edituri");
};
