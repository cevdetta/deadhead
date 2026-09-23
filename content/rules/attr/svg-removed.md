---
ruleId: "attr/svg-removed"
title: "SVG attribute removed in SVG 2"
description: "requiredFeatures, externalResourcesRequired, contentScriptType, contentStyleType, xml:base, kerning and glyph-orientation-horizontal left SVG in SVG 2."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "svg, g, defs, symbol, use, switch, image, path, rect, circle, ellipse, line, polyline, polygon, text, tspan, textpath, a, lineargradient, radialgradient, pattern, clippath, mask, marker, filter, foreignobject, view, script, style, animate, animatemotion, animatetransform, set, mpath, feimage"
match: "logic"
fix: { op: "none" }
replacement: "Delete the attribute. Use CSS font-kerning in place of kerning, and absolute URLs in place of xml:base."
tags: ["svg"]
impacts: ["maintainability"]
related: ["attr/svg-version", "attr/svg-baseprofile", "attr/svg-enable-background", "attr/svg-xlink-removed"]
---

SVG 1.1 carried attributes for jobs that never took hold on the web: declaring a
drawing's script and style languages, testing for feature support, holding the load event
for external resources, rebasing URLs, and tuning glyph spacing and rotation. SVG 2
removed seven of them. They still arrive in HTML inside exported and hand-copied SVG.

## Why avoid

SVG 2 dropped each attribute for its own reason. `requiredFeatures` went because "poor
specification and implementation of this attribute made it unreliable as a test of
feature support". The Changes appendix records "Removed the 'externalResourcesRequired'
attribute", "Removed the 'contentScriptType' attribute", "Removed the 'contentStyleType'
attribute" and "Removed the xml:base attribute". The Text chapter says `kerning` "has
been removed in SVG 2" and "is replaced in SVG 2 by the CSS font-kerning property", and
`glyph-orientation-horizontal` "has been removed in SVG 2".

The engines checked agree. Blink's conditional processing evaluates `requiredExtensions`
and `systemLanguage` and nothing else, so `requiredFeatures` does nothing there. Neither
Blink's nor WebKit's CSS property list carries `kerning` or
`glyph-orientation-horizontal`, and WebKit's list of SVG attribute names leaves out
`externalResourcesRequired`, `contentScriptType` and `contentStyleType`.

`xml:base` is dead before any engine sees it. The HTML syntax puts `xml:lang` and
`xml:space` in the XML namespace and closes the list: "No other namespaced attribute can
be expressed in the HTML syntax." Inline, `xml:base` is a plain attribute with a colon in
its name, and it resolves no URL.

## Use instead

Delete the attribute. Where the drawing needs what it promised, CSS and plain URLs do the
job:

```html
<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <text x="2" y="16" style="font-kerning: none">AV</text>
</svg>
```

## Detectability

Detectable with a selector plus logic. The selector lists SVG element names, which keeps
the rule out of the engine's wildcard bucket. The logic in
`packages/rules/logic/attr/svg-removed.ts` reads the element's attribute names, which
every adapter lowercases, and reports any of the seven. Reading the names avoids asking
for `requiredFeatures` by its camelCase spelling, which a browser compares on SVG
elements in exact case. One finding per element, however many of the seven it carries.
The CLI, the bookmarklet and the ESLint plugin all report; none skips.

`zoomAndPan`, `color-rendering`, `requiredExtensions` and `xml:lang` stay out: SVG 2
still defines them. The same properties written inside `style` are invisible to the
selector.

There is no autofix. The fix op for an attribute takes one name, and the rule covers
seven.

## Resources

- [SVG 2 Appendix K: Changes from SVG 1.1](https://www.w3.org/TR/SVG2/changes.html): W3C Candidate Recommendation, 2018-10-04; the removal lines for five of the seven.
- [SVG 2 Chapter 11: Text](https://www.w3.org/TR/SVG2/text.html): `kerning` and `glyph-orientation-horizontal` "removed in SVG 2", with `font-kerning` as the replacement.
- [SVG 2 §5.7: Conditional processing](https://www.w3.org/TR/SVG2/struct.html): why `requiredFeatures` went.
- [HTML Standard §13.1.2.3: Attributes](https://html.spec.whatwg.org/multipage/syntax.html#attributes-2): the namespaced attributes the HTML syntax expresses, without `xml:base`.
- [Chromium: svg_tests.cc](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_tests.cc): conditional processing over `requiredExtensions` and `systemLanguage`.
