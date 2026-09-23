---
ruleId: "attr/svg-xlink-removed"
title: "SVG xlink:type, role, arcrole, show, actuate or title"
description: "SVG 2 removed xlink:type, xlink:role, xlink:arcrole, xlink:show and xlink:actuate, and deprecated xlink:title; use target and a child <title> instead."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a, animate, animatemotion, animatetransform, feimage, filter, image, lineargradient, mpath, pattern, radialgradient, script, set, textpath, use"
match: "logic"
fix: { op: "none" }
replacement: "Replace xlink:show=\"new\" with target=\"_blank\" and xlink:title with a child <title>; delete xlink:type, xlink:role, xlink:arcrole and xlink:actuate."
tags: ["hyperlinks", "svg"]
impacts: ["maintainability"]
related: ["attr/svg-xlink-href", "attr/svg-version", "attr/xmlns-prefix"]
---

SVG 1.1 took its link attributes from XLink: `xlink:href` for the address, and a set of
descriptors around it for the link's type, role, title and how it opens. SVG 2 kept the
address as a plain `href`, removed five of the descriptors, and deprecated the title for a
child `<title>` element.

## Why avoid

The SVG 2 Changes appendix, under the Linking chapter, "Removed the 'xlink:type',
'xlink:role', 'xlink:arcrole', 'xlink:show' and 'xlink:actuate' attributes" and
"Deprecated the 'xlink:title' attribute in favor of using child 'title' elements". The
Linking chapter keeps `xlink:title` "for backwards compatibility" and adds: "New content
should use a 'title' child element rather than a 'xlink:title' attribute."

Two of the six still act through compatibility code. Blink's `SVGAElement` opens the link
in a new tab when `target` is empty and `xlink:show` is `new`, and returns `xlink:title`
as the element's title. Gecko's `SVGAElement` maps `new` to `_blank` as well, and for
`replace` returns an empty target that skips `<base target>`. The other four,
`xlink:type`, `xlink:role`, `xlink:arcrole` and `xlink:actuate`, appear in neither
engine's `SVGAElement` and do nothing.

So the markup either does nothing or leans on attributes the spec no longer defines, when
`target` and `<title>` say the same thing in current SVG.

## Use instead

```html
<svg viewBox="0 0 24 24" width="24" height="24">
  <a href="https://example.com/" target="_blank">
    <title>Example</title>
    <path d="M4 12h16"/>
  </a>
</svg>
```

Move `xlink:show="new"` to `target="_blank"` and `xlink:title` to a child `<title>`, then
delete the rest.

## Detectability

Detectable with a selector plus logic. The selector reuses the fifteen-element list of
`attr/svg-xlink-href`, since a colon cannot appear in the selector subset; the logic in
`packages/rules/logic/attr/svg-xlink-removed.ts` reports an element that carries any of the
six attributes. The HTML parser puts all six in the XLink namespace, and every adapter
reports the qualified name. The CLI, the bookmarklet and the ESLint plugin all report;
none skips. One finding per element, however many of the six it carries.

There is no autofix. Deleting `xlink:show="new"` makes the link open in the same tab in
Chrome and Firefox, and deleting `xlink:title` drops Chrome's tooltip. The fix op for an
attribute also takes one name, and the rule covers six.

## Resources

- [SVG 2 Appendix K.2.20: Linking chapter changes](https://www.w3.org/TR/SVG2/changes.html#linking): W3C Candidate Recommendation, 2018-10-04; removes five attributes and deprecates `xlink:title`.
- [SVG 2 Chapter 16: Linking](https://www.w3.org/TR/SVG2/linking.html): `xlink:title` is a "Deprecated attribute"; "New content should use a 'title' child element".
- [Chromium: svg_a_element.cc](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_a_element.cc): `xlink:show` `new` maps to `_blank`, and `title()` returns `xlink:title`.
- [Firefox: SVGAElement.cpp](https://searchfox.org/mozilla-central/source/dom/svg/SVGAElement.cpp): `GetLinkTargetImpl` maps `xlink:show` `new` to `_blank` and `replace` to an empty target.
