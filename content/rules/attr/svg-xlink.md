---
ruleId: "attr/svg-xlink"
title: "SVG xlink:* attributes"
description: "SVG 2 deprecates xlink:href and xlink:title and removes five other xlink: attributes. Write href, target and a child <title>."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a, animate, animatemotion, animatetransform, feimage, filter, image, lineargradient, mpath, pattern, radialgradient, script, set, textpath, use"
match: "logic"
fix: { op: "none" }
replacement: "Write plain href: <use href=\"#icon\"></use>. Replace xlink:show=\"new\" with target=\"_blank\" and xlink:title with a child <title>; delete xlink:type, xlink:role, xlink:arcrole and xlink:actuate."
tags: ["hyperlinks", "media", "svg"]
impacts: ["maintainability"]
related: ["element/object-embed-plugin", "attr/svg-version", "attr/xmlns-prefix"]
---

SVG 1.1 took its link attributes from XLink: `xlink:href` for the address, and a set of
descriptors around it for the link's type, role, title and how it opens. SVG 2 kept the
address as a plain `href` and labels the XLink-namespace spelling deprecated, removed five of
the descriptors, and deprecated the title for a child `<title>` element. Readers honor the
plain `href` wherever both spellings are present, so the namespaced tokens are debt on every
element that carries them.

## Why avoid

SVG 2 retires the namespaced address. Section 16.1.6 states the XLink-namespace usage is now
deprecated and URL references should use `href` without a namespace. The same section sets
precedence: where `href` is present in both namespaces the value without a namespace shall be
used and the XLink one shall be ignored. Legacy `xlink:href` is processed if no such `href`
exists on the element, and skipped otherwise. A conforming generator must generate `href`
without a namespace, though it keeps the XLink spelling for backwards compatibility.

The cost of `xlink:href` is namespace debt. Each `xlink:href` in XML content demands an
explicit XLink namespace declaration, and each dual-spelling element states its reference
twice while readers honor the plain spelling. The namespaced token still resolves today:
nothing breaks, though every copy teaches the retired spelling to the next author.

The descriptors go further. The SVG 2 Changes appendix, under the Linking chapter, "Removed
the 'xlink:type', 'xlink:role', 'xlink:arcrole', 'xlink:show' and 'xlink:actuate' attributes"
and "Deprecated the 'xlink:title' attribute in favor of using child 'title' elements". The
Linking chapter keeps `xlink:title` "for backwards compatibility" and adds: "New content
should use a 'title' child element rather than a 'xlink:title' attribute."

Two of the six descriptors still act through compatibility code. Blink's `SVGAElement` opens the link
in a new tab when `target` is empty and `xlink:show` is `new`, and returns `xlink:title`
as the element's title. Gecko's `SVGAElement` maps `new` to `_blank` as well, and for
`replace` returns an empty target that skips `<base target>`. The other four,
`xlink:type`, `xlink:role`, `xlink:arcrole` and `xlink:actuate`, appear in neither
engine's `SVGAElement` and do nothing.

So the markup either does nothing or leans on attributes the spec no longer defines, when
`href`, `target` and `<title>` say the same thing in current SVG.

## Use instead

Write the reference without a namespace, and the link's behaviour with current markup:

```html
<svg viewBox="0 0 24 24" width="24" height="24">
  <defs><circle id="dot" r="4"/></defs>
  <use href="#dot"></use>
  <a href="https://example.com/" target="_blank">
    <title>Example</title>
    <path d="M4 12h16"/>
  </a>
</svg>
```

Where old viewers must keep working, carry both address spellings with matching values while
the migration runs:

```html
<use href="#dot" xlink:href="#dot"></use>
```

The plain value wins wherever both are present, so the pair behaves as one reference. Drop
the namespaced token once the old viewers are gone. Move `xlink:show="new"` to
`target="_blank"` and `xlink:title` to a child `<title>`, then delete the rest.

## Detectability

Complete detection. The rule pre-filters with the fifteen SVG elements that take these
attributes, lowercased for the selector grammar: no `[xlink:href]` spelling exists, since a
colon cannot appear in the subset. The verdict depends on exact attribute presence, so the
decision lives in `packages/rules/logic/attr/svg-xlink.ts`, which reports an element that
carries any of the seven `xlink:` attributes. The HTML parser puts all seven in the XLink
namespace, and every adapter reports the qualified name. A plain `href` alone never trips the
rule, and HTML `a` and `script` collide by tag name with no namespace on the port, so a stray
namespaced attribute there trips it too. One finding per element, however many of the seven
it carries.

There is no autofix. Renaming `xlink:href` changes addressing while deleting it breaks the
reference. Deleting `xlink:show="new"` makes the link open in the same tab in Chrome and
Firefox, and deleting `xlink:title` drops Chrome's tooltip. No subtract op is safe, so
rewrite the attributes by hand.

## Resources

- [SVG2: Deprecated XLink URL reference attributes](https://www.w3.org/TR/SVG2/linking.html#XLinkRefAttrs): the XLink-namespace usage is now deprecated in favor of `href` without a namespace; where both are present the plain value wins and the XLink one is ignored; a conforming generator must emit the plain spelling.
- [SVG2: Processing of URL references](https://www.w3.org/TR/SVG2/linking.html#processingURL): legacy `xlink:href` is processed if no such `href` exists on the element, and skipped otherwise.
- [SVG 2 Chapter 16: `xlink:title`](https://www.w3.org/TR/SVG2/linking.html#XLinkTitleAttribute): `xlink:title` is a "Deprecated attribute"; "New content should use a 'title' child element".
- [SVG 2 Appendix K.2.20: Linking chapter changes](https://www.w3.org/TR/SVG2/changes.html#linking): W3C Candidate Recommendation, 2018-10-04; removes five attributes and deprecates `xlink:title`.
- [MDN: `xlink:href`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/xlink:href): badges the attribute Deprecated, calls for `href` since SVG 2 removed the need for the namespace, and lists the fifteen elements that take it.
- [Chromium: svg_a_element.cc](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_a_element.cc): `xlink:show` `new` maps to `_blank`, and `title()` returns `xlink:title`.
- [Firefox: SVGAElement.cpp](https://searchfox.org/mozilla-central/source/dom/svg/SVGAElement.cpp): `GetLinkTargetImpl` maps `xlink:show` `new` to `_blank` and `replace` to an empty target.
