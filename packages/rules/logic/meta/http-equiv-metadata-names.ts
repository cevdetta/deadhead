import type { MatchFn } from "../../types.ts";
import { stripAsciiWhitespace } from "../../lib/text.ts";

/**
 * `http-equiv` values that are metadata names wearing a pragma's clothes.
 * https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives
 *
 * The pragma table lists exactly seven keywords (`content-language`,
 * `content-type`, `default-style`, `refresh`, `set-cookie`, `x-ua-compatible`,
 * `content-security-policy`). Every value below maps to no state, so the
 * element does nothing — while the standard metadata-names table (or the
 * MetaExtensions registry, or `<meta charset>` / `<html lang>`) defines where
 * each one actually belongs.
 *
 * `robots` and `description` are deliberately absent: own rules
 * (`meta/http-equiv-robots`, `meta/http-equiv-description`) cover them, so
 * each element is reported exactly once.
 */
const MISUSED_NAMES: ReadonlySet<string> = new Set([
  // Standard metadata names — belong in `<meta name>`.
  "author",
  "generator",
  "keywords",
  "theme-color",
  // Registered name extensions — belong in `<meta name>`.
  "audience",
  "apple-mobile-web-app-capable",
  "format-detection",
  "revisit-after",
  // Charset territory — belongs in `<meta charset>`.
  "charset",
  "encoding",
  // Language territory — belongs in `<html lang>`.
  "lang",
  "language",
  // No home anywhere — delete.
  "classification",
  "copyright",
  "distribution",
  "resource-type",
  "title",
]);

/**
 * The `meta[http-equiv]` selector is only a pre-filter. A pragma is misused
 * exactly when its value, stripped and compared ASCII case-insensitively, is
 * one of the names above.
 */
export const match: MatchFn = (element) => {
  const httpEquiv = element.attr("http-equiv");
  if (httpEquiv === undefined) return false;
  return MISUSED_NAMES.has(stripAsciiWhitespace(httpEquiv).toLowerCase());
};
