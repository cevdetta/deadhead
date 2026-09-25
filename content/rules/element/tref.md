---
ruleId: "element/tref"
title: "<tref>"
description: "SVG 2 removed tref, which drew text copied from another element; Blink and Gecko draw nothing for it, WebKit still builds it."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "tref"
fix: { op: "none" }
replacement: "Put the text in the <text> element."
tags: ["svg"]
impacts: ["maintainability"]
related: ["element/altglyph", "element/font-face", "attr/svg-xlink"]
---

SVG 1.1's `<tref>` drew, inside a `<text>`, the characters of another element it referenced by URL. SVG 2 removed it. Blink and Gecko render nothing for it, so the referenced text never appears there; WebKit still carries a class for it.

## Why avoid

SVG 2 cut it. Its Changes appendix records "Removed the 'tref' element." in the Text chapter.

The engines split. Blink's list of SVG tags does not name `tref`, so it is an unknown element that renders nothing. Gecko's SVG sources hold no class for it. WebKit's `svgtags.in` still lists it with `interfaceName=SVGTRefElement`, exposed to scripts as plain `SVGElement` and backed by a C++ class. A label built with `<tref>` can draw in one engine and vanish in the other two.

## Use instead

Put the text in the text element itself:

```html
<svg viewBox="0 0 120 24" width="120" height="24">
  <text x="2" y="16">Label</text>
</svg>
```

## Detectability

Detectable with the selector alone; the port lowercases tag names. The CLI, the bookmarklet and the ESLint plugin all report; none skips.

There is no autofix. WebKit still builds `SVGTRefElement`, so deleting a `<tref>` can drop text that Safari draws. Copy the text into the `<text>` element first, then delete the `<tref>` by hand.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1, Text](https://www.w3.org/TR/SVG2/changes.html#text): W3C Candidate Recommendation, 2018-10-04; "Removed the 'tref' element."
- [Chromium: svg_tag_names.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tag_names.json5): Blink's SVG element list, without `tref`.
- [WebKit: svgtags.in](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/svgtags.in): `tref` with `interfaceName=SVGTRefElement`.
- [Firefox: dom/svg](https://searchfox.org/mozilla-central/source/dom/svg): Gecko's SVG element classes, without one for `tref`.
