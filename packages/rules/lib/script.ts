import type { ElementPort } from "../types.ts";
import { asciiLowercase, stripAsciiWhitespace } from "./text.ts";

/**
 * The JavaScript MIME type essences, verbatim from the MIME Sniffing Standard.
 * https://mimesniff.spec.whatwg.org/#javascript-mime-type
 *
 * The legacy `javascript1.x`, `jscript` and `livescript` spellings are in the
 * list because the standard keeps them there; they behave identically.
 */
const JAVASCRIPT_MIME_ESSENCES: ReadonlySet<string> = new Set([
  "application/ecmascript",
  "application/javascript",
  "application/x-ecmascript",
  "application/x-javascript",
  "text/ecmascript",
  "text/javascript",
  "text/javascript1.0",
  "text/javascript1.1",
  "text/javascript1.2",
  "text/javascript1.3",
  "text/javascript1.4",
  "text/javascript1.5",
  "text/jscript",
  "text/livescript",
  "text/x-ecmascript",
  "text/x-javascript",
]);

/** A *JavaScript MIME type essence match*: ASCII case-insensitive, nothing stripped. */
export const isJavaScriptMimeEssence = (value: string): boolean => JAVASCRIPT_MIME_ESSENCES.has(asciiLowercase(value));

/**
 * The script block's type string, per HTML "prepare the script element":
 * an empty `type`, an empty `language` with no `type`, or neither attribute
 * gives `text/javascript`; otherwise a `type` value with ASCII whitespace
 * stripped; otherwise `text/` plus the `language` value, not stripped.
 * https://html.spec.whatwg.org/multipage/scripting.html#prepare-the-script-element
 */
export function scriptTypeString(element: ElementPort): string {
  const type = element.attr("type");
  const language = element.attr("language");
  if (type === "" || (type === undefined && (language === undefined || language === ""))) return "text/javascript";
  if (type !== undefined) return stripAsciiWhitespace(type);
  return `text/${language}`;
}

/** Whether the element prepares as a classic script: its type string is a JavaScript MIME type essence match. */
export const isClassicScript = (element: ElementPort): boolean => isJavaScriptMimeEssence(scriptTypeString(element));
