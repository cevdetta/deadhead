import type { ElementPort } from "../types.ts";
import { stripAsciiWhitespace } from "./text.ts";

/** A `<meta>` whose `http-equiv` trims to `content-security-policy`. */
const isCspMeta = (element: ElementPort): boolean => {
  const httpEquiv = element.attr("http-equiv");
  return httpEquiv !== undefined && stripAsciiWhitespace(httpEquiv).toLowerCase() === "content-security-policy";
};

/**
 * The directive names of a serialized policy, in order: the first token of each
 * `;` part, ASCII-lowercased, as CSP3's parser reads them. A value that holds a
 * directive's name (a URL path, say) is never a name.
 */
const directiveNames = (content: string): string[] => {
  const names: string[] = [];
  for (const part of content.split(";")) {
    const trimmed = stripAsciiWhitespace(part);
    if (trimmed === "") continue;
    const end = trimmed.search(/[\t\n\f\r ]/);
    names.push((end === -1 ? trimmed : trimmed.slice(0, end)).toLowerCase());
  }
  return names;
};

/**
 * A CSP meta tag whose `content` names `name` as a directive. `name` is
 * lowercase; the comparison folds ASCII case through `directiveNames`, so a
 * value that holds the name never counts.
 */
export const hasDirective = (element: ElementPort, name: string): boolean => {
  if (!isCspMeta(element)) return false;
  const content = element.attr("content");
  return content !== undefined && directiveNames(content).includes(name);
};
