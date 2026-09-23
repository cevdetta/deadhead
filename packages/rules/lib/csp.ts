import type { ElementPort } from "../types.ts";
import { stripAsciiWhitespace } from "./text.ts";

/** A `<meta>` whose `http-equiv` trims to `content-security-policy`. */
export const isCspMeta = (element: ElementPort): boolean => {
  const httpEquiv = element.attr("http-equiv");
  return httpEquiv !== undefined && stripAsciiWhitespace(httpEquiv).toLowerCase() === "content-security-policy";
};

/**
 * The directive names of a serialized policy, in order: the first token of each
 * `;` part, ASCII-lowercased, as CSP3's parser reads them. A value that holds a
 * directive's name (a URL path, say) is never a name.
 */
export const directiveNames = (content: string): string[] => {
  const names: string[] = [];
  for (const part of content.split(";")) {
    const trimmed = stripAsciiWhitespace(part);
    if (trimmed === "") continue;
    const end = trimmed.search(/[\t\n\f\r ]/);
    names.push((end === -1 ? trimmed : trimmed.slice(0, end)).toLowerCase());
  }
  return names;
};
