---
ruleId: "element/cursor"
title: "<cursor>"
description: "SVG 2 removed the cursor element, and no engine builds it any longer, so it sets no cursor. Use CSS cursor: url(…) instead."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "cursor"
fix: { op: "remove-element" }
replacement: "CSS cursor: url(…) with an image file and a fallback keyword."
tags: ["svg"]
impacts: ["maintainability"]
related: ["element/solidcolor", "element/font-face", "attr/svg-1-1-attributes"]
---

SVG 1.1's `<cursor>` defined a pointer image in markup, which the `cursor` property could reference by fragment. SVG 2 removed it, CSS covers the job with `cursor: url(…)`, and every engine has dropped its class, so the element sets no cursor anywhere.

## Why avoid

SVG 2 cut it. Its Changes appendix records "Removed the cursor element and the SVG specific definition of the cursor property" in the Interactivity chapter.

The engines followed. Blink removed `SVGCursorElement` in December 2016, and its list of SVG tags no longer names `cursor`. WebKit stopped exposing the element in 2022 and deleted `SVGCursorElement` in March 2026 with the commit "[SVG2] Remove `SVGCursorElement`"; its `svgtags.in` no longer lists `cursor`, so the tag becomes an `SVGUnknownElement`. Gecko's SVG sources hold no class for it. A `<cursor>` today is an unknown element in all three engines.

## Use instead

Point the CSS `cursor` property at an image file, with a keyword fallback:

```css
.handle { cursor: url("/cursors/grab.svg") 4 4, grab; }
```

## Detectability

Detectable with the selector alone; the port lowercases tag names. The CLI, the bookmarklet and the ESLint plugin all report; none skips.

The autofix deletes the element. No engine builds a class for it, so it draws nothing and sets no cursor, and a `cursor: url(#…)` that points at it resolves to nothing before and after the deletion.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1, Interactivity](https://www.w3.org/TR/SVG2/changes.html#interact): W3C Candidate Recommendation, 2018-10-04; "Removed the cursor element and the SVG specific definition of the cursor property".
- [Chromium: Remove SVGCursorElement](https://chromium.googlesource.com/chromium/src.git/+/f63d67df608751f83eaa15a67df069a38714f171): Blink's removal, 2016-12-13.
- [WebKit: \[SVG2\] Remove `SVGCursorElement`](https://github.com/WebKit/WebKit/commit/230771c93ca1c72406ef0a93bd5709af34f05525): deletes the class and its cursor-image integration; says WebKit stopped exposing the element in 2022.
- [WebKit: svgtags.in](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/svgtags.in): no `cursor` entry; unlisted tags fall back to `SVGUnknownElement`.
- [Chromium: svg_tag_names.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tag_names.json5): Blink's SVG element list, without `cursor`.
- [Firefox: dom/svg](https://searchfox.org/mozilla-central/source/dom/svg): Gecko's SVG element classes, without one for `cursor`.
