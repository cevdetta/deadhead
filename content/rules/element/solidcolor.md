---
ruleId: "element/solidcolor"
title: "<solidcolor>"
description: "A draft SVG 2 paint server that SVG 2 removed and no engine builds, so it paints nothing. Use a CSS custom property instead."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "solidcolor"
fix: { op: "remove-element" }
replacement: "A CSS custom property holding the color, used in fill or stroke."
tags: ["svg"]
impacts: ["maintainability"]
related: ["element/cursor", "element/font-face", "attr/svg-1-1-attributes"]
---

`<solidcolor>` was a paint server for a single color, meant to let many shapes share one color through `fill="url(#id)"`. SVG 2 drafts took it from SVG Tiny 1.2's `solidColor` and then removed it. No engine builds it, so it paints nothing.

## Why avoid

SVG 2 cut it. Its Changes appendix records both steps in the Paint Servers chapter: "Added the solidcolor element and its two properties solid-color and solid-opacity, ported over from SVG Tiny 1.2", and later "Removed the solidcolor element and the solid-color and solid-opacity properties."

No engine builds it. Blink's list of SVG tags does not name `solidcolor`, Gecko's SVG sources hold no class for it, and WebKit's `svgtags.in` does not list it, so the tag becomes an `SVGUnknownElement`. A shape whose `fill` points at it gets no color from it in any engine.

## Use instead

Hold the shared color in a CSS custom property:

```html
<svg viewBox="0 0 24 24" width="24" height="24" style="--brand-red: #c0392b">
  <circle cx="12" cy="12" r="10" style="fill: var(--brand-red)"></circle>
</svg>
```

## Detectability

Detectable with the selector alone; the port lowercases tag names. The CLI, the bookmarklet and the ESLint plugin all report; none skips.

The autofix deletes the element. No engine builds a class for it, so it renders nothing. A `fill="url(#…)"` that points at it stays invalid after the deletion: SVG 2 treats a reference to "an element that does not exist or which is not a valid paint server" the same way, so the shape paints as it did before.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1, Paint Servers](https://www.w3.org/TR/SVG2/changes.html#pservers): W3C Candidate Recommendation, 2018-10-04; the addition and the removal of `solidcolor`.
- [SVG 2: Specifying paint](https://www.w3.org/TR/SVG2/painting.html#SpecifyingPaint): a reference to an element that does not exist and one to an element that is not a paint server are both invalid, with the same fallback.
- [Chromium: svg_tag_names.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tag_names.json5): Blink's SVG element list, without `solidcolor`.
- [WebKit: svgtags.in](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/svg/svgtags.in): no `solidcolor` entry; unlisted tags fall back to `SVGUnknownElement`.
- [Firefox: dom/svg](https://searchfox.org/mozilla-central/source/dom/svg): Gecko's SVG element classes, without one for `solidcolor`.
