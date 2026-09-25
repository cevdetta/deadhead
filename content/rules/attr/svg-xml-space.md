---
ruleId: "attr/svg-xml-space"
title: "<svg xml:space>"
description: "SVG 2 deprecates xml:space for the CSS white-space property; browsers still map it, so move the behaviour to CSS before deleting it."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "svg, g, defs, symbol, use, switch, image, path, rect, circle, ellipse, line, polyline, polygon, text, tspan, textpath, a, lineargradient, radialgradient, pattern, clippath, mask, marker, filter, foreignobject, view, script, style, animate, animatemotion, animatetransform, set, mpath, feimage"
match: "logic"
fix: { op: "none" }
replacement: "Move the behaviour to CSS, then delete the attribute: xml:space=\"preserve\" becomes style=\"white-space: pre\" on the <text>."
tags: ["svg"]
impacts: ["maintainability"]
related: ["attr/svg-1-1-attributes", "attr/svg-xlink", "attr/svg-version"]
---

`xml:space="preserve"` is how SVG 1.1 kept the spaces inside `<text>`. SVG 2 moved that
job to the CSS `white-space` property and kept the attribute as a deprecated fallback.
Browsers still read it, each by its own mapping, so the move to CSS comes before the
deletion.

## Why avoid

SVG 2 keeps `xml:space` as a compatibility shim. §5.12.4 defines it as a "Deprecated XML
attribute to specify whether white space is preserved in character data" and adds: "New
content should use the white-space property instead." The Text chapter's section on
legacy white-space handling says the same, lets CSS win ("If the white-space property is
set on any element, then the value of 'xml:space' is ignored"), and tells authors
reworking old content to "use white-space and remove any existing 'xml:space'".

Each engine maps it its own way. Blink treats it as a presentation attribute on `text`,
`tspan` and `textPath`: `preserve` becomes the longhands of `white-space: pre`, and any
other value becomes `nowrap`. Gecko's SVG stylesheet gives any element with
`xml:space="preserve"` the value `white-space: preserve-spaces` and has no rule for
`default`. The same markup can lay out two ways in the two engines, and a CSS
`white-space` declaration overrides it without warning.

## Use instead

Put the white-space handling in CSS, then delete the attribute:

```html
<svg viewBox="0 0 120 24" width="120" height="24">
  <text x="2" y="16" style="white-space: pre">a   b</text>
</svg>
```

`xml:space="default"` with no `preserve` ancestor restates the default and goes as is.

## Detectability

Detectable with a selector plus logic. The selector lists SVG element names; the logic in
`packages/rules/logic/attr/svg-xml-space.ts` reads the lowercased attribute names and
reports `xml:space`. The HTML syntax puts `xml:space` in the XML namespace on SVG
elements, and every adapter reports the qualified name. The CLI, the bookmarklet and the
ESLint plugin all report; none skips. On the HTML elements that share a name with the list
(`a`, `script`, `style`), `xml:space` is a plain attribute with no effect, and the rule
reports it the same way.

There is no autofix. Deleting `preserve` changes how Blink and Gecko lay out the text,
and the replacement is CSS, which no fix op writes.

## Resources

- [SVG 2 §5.12.4: The 'xml:space' attribute](https://www.w3.org/TR/SVG2/struct.html#XMLSpaceAttribute): "Deprecated XML attribute"; "New content should use the white-space property instead."
- [SVG 2 §11.10.3.3: Legacy white-space handling](https://www.w3.org/TR/SVG2/text.html): "deprecated in new content, retained for backwards compatibility", with `white-space` taking precedence.
- [Chromium: svg_text_content_element.cc](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/svg/svg_text_content_element.cc): `xml:space` as a presentation attribute, with `preserve` mapped to the `white-space: pre` longhands.
- [Firefox: layout/svg/svg.css](https://searchfox.org/mozilla-central/source/layout/svg/svg.css): `*[xml|space="preserve"] { white-space: preserve-spaces; }`.
