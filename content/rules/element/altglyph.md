---
ruleId: "element/altglyph"
title: "<altGlyph> elements"
description: "SVG 2 removed altGlyph, altGlyphDef, altGlyphItem and glyphRef; Blink and Gecko ignore them, WebKit still builds them. Use a web font."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "altglyph, altglyphdef, altglyphitem, glyphref"
fix: { op: "none" }
replacement: "A web font with the glyph."
tags: ["svg"]
impacts: ["maintainability"]
related: ["element/font-face", "element/tref", "attr/svg-1-1-attributes"]
---

SVG 1.1's `<altGlyph>` swapped the characters of a text run for alternate glyphs, chosen through `<altGlyphDef>`, `<altGlyphItem>` and `<glyphRef>`. SVG 2 removed all four. Blink and Gecko treat them as unknown elements that render nothing; WebKit still carries classes for them.

## Why avoid

SVG 2 cut them. Its Changes appendix records "Removed the 'altGlyph', 'altGlyphDef', 'altGlyphItem' and 'glyphRef' elements" in the Text chapter.

The engines split. Blink's list of SVG tags names none of the four, so each is an unknown element that renders nothing. Gecko's SVG sources hold no class for any of them. WebKit's `svgtags.in` still lists all four, exposed to scripts as plain `SVGElement` and backed by C++ classes: `SVGAltGlyphElement`, `SVGAltGlyphDefElement`, `SVGAltGlyphItemElement` and `SVGGlyphRefElement`. Text inside them can draw in one engine and vanish in the other two.

## Use instead

Put the glyph in a web font and select it with CSS, through the font's own characters or its OpenType features:

```html
<svg viewBox="0 0 120 24" width="120" height="24">
  <text x="2" y="16" style="font-family: 'Brand', sans-serif; font-feature-settings: 'ss01'">Label</text>
</svg>
```

## Detectability

Detectable with the selector alone; the port lowercases tag names. The CLI, the bookmarklet and the ESLint plugin all report; none skips.

The generated stylesheet has one gap. The HTML parser writes `altGlyph`, `altGlyphDef`, `altGlyphItem` and `glyphRef` in camelCase, and a browser matches type selectors on SVG elements in exact case, so `deadhead.css` cannot outline these four. The engine reports them in every adapter.

There is no autofix. WebKit still builds classes for all four, so deleting an `<altGlyph>` can drop text that Safari draws. Move the glyph to a web font first, then delete the elements by hand.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1, Text](https://www.w3.org/TR/SVG2/changes.html#text): W3C Candidate Recommendation, 2018-10-04; "Removed the 'altGlyph', 'altGlyphDef', 'altGlyphItem' and 'glyphRef' elements".
- [Chromium: svg_tag_names.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tag_names.json5): Blink's SVG element list, without any of the four.
- [WebKit: svgtags.in](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/svgtags.in): all four, each with a class in `Source/WebCore/svg`.
- [Firefox: dom/svg](https://searchfox.org/mozilla-central/source/dom/svg): Gecko's SVG element classes, with none of the four.
