import type { FixableFn } from "../../types.ts";
import { isClassicScript } from "../../lib/script.ts";

/**
 * `charset` on `a` and `link` is a hint nothing reads: the linked resource
 * declares its own encoding in its `Content-Type` header, so removal is inert.
 * https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features
 *
 * HTML "prepare the script element" decodes an external classic script with
 * the encoding `charset` names, before falling back to the document's. No
 * other script reads it: an inline script is part of the document, a module
 * script's fetch always decodes UTF-8, and an import map, speculation rules
 * or data block fetches nothing as a classic script.
 * https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element
 * https://html.spec.whatwg.org/multipage/webappapis.html#fetch-a-single-module-script
 */
export const fixable: FixableFn = (element) =>
  element.tag !== "script" || !element.hasAttr("src") || !isClassicScript(element);
