/**
 * HTML's "adjust SVG tag names" table: the tokenizer lowercases, and the tree
 * builder puts these back in camelCase on SVG elements. CSS matches type
 * selectors on SVG in exact case, so the stylesheet needs this spelling.
 * https://html.spec.whatwg.org/multipage/parsing.html#adjust-svg-tag-names
 */
export const SVG_CAMEL: ReadonlyMap<string, string> = new Map(
  [
    "altGlyph", "altGlyphDef", "altGlyphItem", "animateColor", "animateMotion", "animateTransform",
    "clipPath", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix",
    "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA",
    "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode",
    "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile",
    "feTurbulence", "foreignObject", "glyphRef", "linearGradient", "radialGradient", "textPath",
  ].map((name) => [name.toLowerCase(), name]),
);
