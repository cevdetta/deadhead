import type { FixableFn } from "../../types.ts";
import { asciiLowercase } from "../../lib/text.ts";

/**
 * Three keywords here still have readers. WebSub makes `rel="self"` the HTML
 * discovery of a topic URL, and the WordPress apps read `rel="EditURI"` to
 * find the XML-RPC endpoint; neither creates an HTML link. HTML has user
 * agents treat `previous` like `prev`, a link other search engines may read.
 * The op deletes every keyword the selector tests, so a `rel` holding any of
 * the three keeps all of them.
 * https://www.w3.org/TR/websub/#discovery
 * https://html.spec.whatwg.org/multipage/links.html#linkTypes
 */
export const fixable: FixableFn = (element) => {
  const tokens = asciiLowercase(element.attr("rel") ?? "").split(/[\t\n\f\r ]+/);
  return !tokens.includes("self") && !tokens.includes("edituri") && !tokens.includes("previous");
};
