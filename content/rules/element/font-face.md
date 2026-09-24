---
ruleId: "element/font-face"
title: "<font-face> SVG font elements"
description: "SVG 2 dropped SVG fonts; Blink and Gecko ignore font-face, glyph and hkern, while WebKit still builds them. Use a WOFF2 web font."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "font-face, font-face-src, font-face-uri, font-face-format, font-face-name, glyph, missing-glyph, hkern, vkern"
fix: { op: "none" }
replacement: "A WOFF2 web font through @font-face."
tags: ["svg"]
impacts: ["maintainability"]
related: ["element/font", "element/altglyph", "element/tref"]
---

SVG 1.1 could define a whole font in markup: `<font-face>` with its `<font-face-src>`, `<font-face-uri>`, `<font-face-format>` and `<font-face-name>` children described it, `<glyph>` and `<missing-glyph>` drew the letters, and `<hkern>` and `<vkern>` spaced them. SVG 2 removed the feature. Blink and Gecko render none of these nine elements; WebKit still carries code for all of them.

## Why avoid

SVG 2 cut the chapter whole. Its Changes appendix records "Removed this chapter and the SVG Fonts feature it contained", and with it `glyph`, `missing-glyph`, `hkern`, `vkern` and the five `font-face*` elements.

The engines split. Blink's list of SVG tags names none of the nine, so each one is an unknown element that renders nothing. Gecko's SVG sources hold no class for any of them. WebKit's `svgtags.in` still lists all nine, exposed to scripts as plain `SVGElement` and backed by C++ classes such as `SVGFontFaceElement`, `SVGGlyphElement`, `SVGHKernElement` and `SVGVKernElement`, plus an SVG-to-OpenType font converter. A font defined this way can draw in one engine and vanish in the other two.

## Use instead

Serve the font as WOFF2 through CSS and use it from the text element:

```html
<style>
  @font-face { font-family: "Brand"; src: url("/fonts/brand.woff2") format("woff2"); }
</style>
<svg viewBox="0 0 120 24" width="120" height="24">
  <text x="2" y="16" style="font-family: 'Brand', sans-serif">Label</text>
</svg>
```

## Detectability

Detectable with the selector alone; the port lowercases tag names. SVG `<font>` stays with `element/font`, which fires on the tag already. The CLI, the bookmarklet and the ESLint plugin all report; none skips.

There is no autofix. WebKit still compiles classes for all nine elements and a converter that turns them into an OpenType font, so no source shows that deleting them is inert in Safari. Move the text to a web font first, then delete the markup by hand.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1, Fonts](https://www.w3.org/TR/SVG2/changes.html#fonts): W3C Candidate Recommendation, 2018-10-04; "Removed this chapter and the SVG Fonts feature it contained".
- [Chromium: svg_tag_names.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tag_names.json5): Blink's SVG element list, without any of the nine.
- [WebKit: svgtags.in](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/svgtags.in): all nine, with element classes such as `SVGHKernElement` and `SVGVKernElement`.
- [WebKit: `SVGToOTFFontConversion.cpp`](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/SVGToOTFFontConversion.cpp): the converter that turns SVG font elements into an OpenType font.
- [Firefox: dom/svg](https://searchfox.org/mozilla-central/source/dom/svg): Gecko's SVG element classes, with none of the nine.
