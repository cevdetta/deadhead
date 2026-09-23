import type { FixableFn } from "../../types.ts";
import { isJavaScriptMimeEssence, scriptTypeString } from "../../lib/script.ts";

/**
 * HTML "prepare the script element" reads `language` only when there is no
 * `type`: an empty value gives "text/javascript", any other gives "text/" plus
 * the value, unstripped. With no `language` the type string is
 * "text/javascript", so deleting it changes nothing exactly when the type
 * string is already a JavaScript MIME type essence match. `language="vbscript"`
 * keeps a block from running; deleting it would start the block.
 * https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element
 */
export const fixable: FixableFn = (element) =>
  element.hasAttr("type") || isJavaScriptMimeEssence(scriptTypeString(element));
