import type { ElementPort, FixableFn } from "../../types.ts";
import { isClassicScript } from "../../lib/script.ts";
import { asciiLowercase } from "../../lib/text.ts";

/**
 * `charset` on `a` is a hint nothing reads: the linked resource declares its
 * own encoding in its `Content-Type` header, so removal is inert. The same
 * holds for a `link` that loads no stylesheet.
 * https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features
 *
 * A stylesheet `link` still decodes by it. Blink's `LinkResource::GetCharset()`
 * returns the `charset` attribute's encoding and `LinkStyle::Process()` passes
 * it to `LoadStylesheetIfNeeded`; Gecko's `GetFallbackEncoding` in the CSS
 * `Loader` reads `LinkStyle::GetCharset`, which `HTMLLinkElement` answers with
 * the attribute. A stylesheet with no BOM, no HTTP charset and no `@charset`
 * decodes by that value, so deleting it can change the decoded text.
 * https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/html/link_resource.cc
 * https://chromium.googlesource.com/chromium/src/+/main/third_party/blink/renderer/core/html/link_style.cc
 * https://searchfox.org/mozilla-central/source/layout/style/Loader.cpp
 *
 * HTML "prepare the script element" decodes an external classic script with
 * the encoding `charset` names, before falling back to the document's. No
 * other script reads it: an inline script is part of the document, a module
 * script's fetch always decodes UTF-8, and an import map, speculation rules
 * or data block fetches nothing as a classic script.
 * https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element
 * https://html.spec.whatwg.org/multipage/webappapis.html#fetch-a-single-module-script
 */
const loadsStylesheet = (element: ElementPort): boolean =>
  element.hasAttr("href") && asciiLowercase(element.attr("rel") ?? "").split(/[\t\n\f\r ]+/).includes("stylesheet");

export const fixable: FixableFn = (element) => {
  if (element.tag === "link") return !loadsStylesheet(element);
  if (element.tag === "script") return !element.hasAttr("src") || !isClassicScript(element);
  return true;
};
