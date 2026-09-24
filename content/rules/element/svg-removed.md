---
ruleId: "element/svg-removed"
title: "SVG element removed in SVG 2"
description: "SVG 2 removed tref, altGlyph and glyphRef, the SVG font elements, cursor and solidcolor; Blink and Gecko ignore them, and WebKit still builds most."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "tref, altglyph, altglyphdef, altglyphitem, glyphref, glyph, missing-glyph, hkern, vkern, font-face, font-face-src, font-face-uri, font-face-format, font-face-name, cursor, solidcolor"
fix: { op: "none" }
replacement: "Delete the element and move its job to current markup: the text itself for tref, a web font for altGlyph and SVG fonts, CSS cursor: url(…) for cursor, a CSS custom property for solidcolor."
tags: ["svg"]
impacts: ["maintainability"]
related: ["element/font", "attr/svg-1-1-attributes", "attr/svg-xlink", "attr/svg-enable-background"]
---

SVG 1.1 could reference text from elsewhere in the document (`<tref>`), swap in alternate
glyphs (`<altGlyph>`), define whole fonts in markup (`<glyph>`, `<hkern>`,
`<font-face>`), and declare its own cursors (`<cursor>`). SVG 2 removed all of it, along
with the draft `<solidcolor>` paint server. Blink and Gecko render none of these
elements; WebKit still carries code for most of them.

## Why avoid

SVG 2 cut these elements with the features behind them. Its Changes appendix records
"Removed the 'tref' element", "Removed the 'altGlyph', 'altGlyphDef', 'altGlyphItem' and
'glyphRef' elements", "Removed the cursor element" and "Removed the solidcolor element".
The SVG Fonts chapter went whole: "Removed this chapter and the SVG Fonts feature it
contained", with `glyph`, `missing-glyph`, `hkern`, `vkern` and the five `font-face*`
elements.

The engines split. Blink's list of SVG tags names none of the sixteen, so each one is an
unknown element that renders nothing. Gecko's SVG sources hold no class for any of them.
WebKit's `svgtags.in` still lists fourteen, exposed to scripts as plain `SVGElement` and
backed by C++ classes, among them `SVGTRefElement` and an SVG-to-OpenType font converter.
Markup that uses them can draw in one engine and vanish in the other two.

## Use instead

Put the text in the text element, and the font in a web font:

```html
<svg viewBox="0 0 120 24" width="120" height="24">
  <text x="2" y="16" style="font-family: 'Brand', sans-serif">Label</text>
</svg>
```

A `<cursor>` becomes CSS `cursor: url(…)`, and a `<solidcolor>` becomes a CSS custom
property.

## Detectability

Detectable with the selector alone; the port lowercases tag names. SVG `<font>` stays with
`element/font`, which fires on the tag already. The CLI, the bookmarklet and the ESLint
plugin all report; none skips.

The generated stylesheet has one gap. The HTML parser writes `altGlyph`, `altGlyphDef`,
`altGlyphItem` and `glyphRef` in camelCase, and a browser matches type selectors on SVG
elements in exact case, so `deadhead.css` cannot outline those four. The engine reports
them in every adapter.

There is no autofix. WebKit still compiles classes for fourteen of the sixteen, so
deleting a `<tref>` or an `<altGlyph>` can drop text that Safari draws. `<cursor>` and
`<solidcolor>` have no class in any engine checked and are safe to delete by hand.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1](https://www.w3.org/TR/SVG2/changes.html): W3C Candidate Recommendation, 2018-10-04; the removal lines for all sixteen elements.
- [Chromium: svg_tag_names.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tag_names.json5): Blink's SVG element list, without any of the sixteen.
- [WebKit: svgtags.in](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/svgtags.in): fourteen of the sixteen, with element classes such as `SVGTRefElement`, `SVGHKernElement` and `SVGVKernElement`.
- [Firefox: dom/svg](https://searchfox.org/mozilla-central/source/dom/svg): Gecko's SVG element classes, with none of the sixteen.
