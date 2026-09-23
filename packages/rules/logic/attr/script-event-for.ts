import type { FixableFn } from "../../types.ts";
import { isClassicScript } from "../../lib/script.ts";
import { asciiLowercase, stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * HTML "prepare the script element": a classic script carrying both `for` and
 * `event` returns before it runs unless `for` is "window" and `event` is
 * "onload" or "onload()", each an ASCII case-insensitive match once ASCII
 * whitespace is stripped. Anywhere else on a classic script the pair keeps it
 * from running, and deleting `event` would start it. A lone `event` or `for`
 * does nothing, the step skips every other script type (Chromium's
 * `IsScriptForEventSupported` agrees), and the pair that names the window's
 * load changes nothing.
 * https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element
 */
export const fixable: FixableFn = (element) => {
  const target = element.attr("for");
  const event = element.attr("event");
  if (target === undefined || event === undefined || !isClassicScript(element)) return true;
  const on = asciiLowercase(stripAsciiWhitespace(event));
  return asciiLowercase(stripAsciiWhitespace(target)) === "window" && (on === "onload" || on === "onload()");
};
