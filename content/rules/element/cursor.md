---
ruleId: "element/cursor"
title: "<cursor>"
description: "SVG 2 removed the cursor element; Blink, Gecko and current WebKit ignore it, while older Safari still reads it. Use CSS cursor: url(…)."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "cursor"
match: "logic"
fix: { op: "remove-element" }
replacement: "CSS cursor: url(…) with an image file and a fallback keyword."
tags: ["svg"]
impacts: ["maintainability"]
related: ["element/solidcolor", "element/font-face", "attr/svg-1-1-attributes"]
---

SVG 1.1's `<cursor>` defined a pointer image in markup, which the `cursor` property could reference by fragment. SVG 2 removed it, and CSS covers the job with `cursor: url(…)`. Blink and Gecko build no class for it, and WebKit deleted its class in March 2026, but Safari releases built before that change still use a `<cursor>` that CSS points at.

## Why avoid

SVG 2 cut it. Its Changes appendix records "Removed the cursor element and the SVG specific definition of the cursor property" in the Interactivity chapter.

The engines followed. Blink removed `SVGCursorElement` in December 2016, and its list of SVG tags no longer names `cursor`. Gecko's SVG sources hold no class for it. WebKit hid the element from scripts in 2022 but kept the class, and its `Style::CursorImage::updateCursorElement` resolved `cursor: url(#id)` to the `<cursor>` element and loaded the element's `href` as the cursor image, with the element's `x` and `y` as the hot spot. The commit "[SVG2] Remove `SVGCursorElement`" deleted both in March 2026, and `svgtags.in` no longer lists `cursor`, so current WebKit makes it an `SVGUnknownElement`. Safari builds from before that commit still draw the cursor.

## Use instead

Point the CSS `cursor` property at an image file, with a keyword fallback:

```css
.handle { cursor: url("/cursors/grab.svg") 4 4, grab; }
```

## Detectability

Detectable with the selector alone; the port lowercases tag names. The CLI, the bookmarklet and the ESLint plugin all report; none skips.

The autofix deletes a `<cursor>` only when it has no `id` and sits inside `<svg>`; the logic in `packages/rules/logic/element/cursor.ts` vetoes the rest. Without an `id`, no `cursor: url(#…)` can reach it, so older Safari has nothing to resolve, and it is no named property on `window`. Outside `<svg>` the tag is an HTML unknown element whose children render, so deleting it would delete visible content. A finding on a `<cursor>` with an `id` carries no fix: move the image into CSS, then delete the element by hand.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1, Interactivity](https://www.w3.org/TR/SVG2/changes.html#interact): W3C Candidate Recommendation, 2018-10-04; "Removed the cursor element and the SVG specific definition of the cursor property".
- [Chromium: Remove SVGCursorElement](https://chromium.googlesource.com/chromium/src.git/+/f63d67df608751f83eaa15a67df069a38714f171): Blink's removal, 2016-12-13.
- [WebKit: \[SVG2\] Remove `SVGCursorElement`](https://github.com/WebKit/WebKit/commit/230771c93ca1c72406ef0a93bd5709af34f05525): 309308@main, 2026-03-16; deletes `SVGCursorElement`, the `cursor` line in `svgtags.in` and `CursorImage::updateCursorElement`, which loaded the referenced element's `href` as the cursor image.
- [HTML Standard: Named access on the Window object](https://html.spec.whatwg.org/multipage/nav-history-apis.html#named-access-on-the-window-object): every element with an ID is a named property of `window`.
- [WebKit: svgtags.in](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/svgtags.in): no `cursor` entry; unlisted tags fall back to `SVGUnknownElement`.
- [Chromium: svg_tag_names.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tag_names.json5): Blink's SVG element list, without `cursor`.
- [Firefox: dom/svg](https://searchfox.org/mozilla-central/source/dom/svg): Gecko's SVG element classes, without one for `cursor`.
