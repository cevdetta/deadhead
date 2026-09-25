---
ruleId: "attr/svg-baseprofile"
title: "<svg baseProfile>"
description: "SVG 2 removed baseProfile from <svg>; it set no processing restriction and was metadata for authoring tools, so delete it."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "svg[baseProfile]"
fix: { op: "remove-attribute", attr: "baseprofile" }
replacement: "Delete the attribute: <svg viewBox=\"0 0 24 24\">."
tags: ["svg"]
impacts: ["maintainability"]
related: ["attr/svg-version", "attr/svg-xlink", "attr/html-version"]
---

`<svg baseProfile="full">` names the SVG 1.1 profile a drawing needs: `full`, `basic` or
`tiny`. It was a note for authoring tools, and SVG 2 removed it along with `version`.
Editors still write it into exports, and it reaches HTML with every icon pasted inline.

## Why avoid

SVG 1.1 defined `baseProfile` to describe "the minimum SVG language profile that the
author believes is necessary to correctly render the content", then added: "The attribute
does not specify any processing restrictions; It can be considered metadata." Its example
use was an authoring tool warning when an edit left the declared profile. SVG 2 removed
it: the Changes appendix lists "Removed the baseProfile and version attributes from the
'svg' element". MDN marks it deprecated and repeats the metadata sentence.

In an HTML page no authoring tool reads it. It names a profile the browser does not apply,
and each pasted copy of the icon carries the dead bytes again.

## Use instead

Delete the attribute:

```html
<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M4 12h16"/>
</svg>
```

## Detectability

Detectable with the selector alone. The selector keeps the attribute's own case,
`svg[baseProfile]`. The CLI and ESLint adapters look attributes up without regard to case,
so either spelling matches there. The case matters in the browser and for the generated
stylesheet, which uses the selector as written: HTML §4.16.2 lowercases a selector's
attribute name for "attributes on HTML elements in HTML documents" and compares every
other attribute "according to its original case", so a browser would never match
`svg[baseprofile]` against the parser's `baseProfile`.

The fix removes the attribute. Metadata with no processing restriction has nothing to
lose. The CLI and the ESLint plugin report and fix; the bookmarklet reports without a fix,
having no source text. `version`, removed in the same line of the Changes appendix, has
its own rule, `attr/svg-version`.

## Resources

- [SVG 2 Appendix K.2.6: Document Structure chapter changes](https://www.w3.org/TR/SVG2/changes.html#structure): W3C Candidate Recommendation, 2018-10-04; "Removed the baseProfile and version attributes from the 'svg' element".
- [SVG 1.1 (Second Edition) §5.1.2: The 'svg' element](https://www.w3.org/TR/SVG11/struct.html#SVGElementBaseProfileAttribute): "The attribute does not specify any processing restrictions; It can be considered metadata."
- [MDN: baseProfile](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/baseProfile): marked deprecated; "it can be considered metadata".
- [HTML Standard §4.16.2: Case-sensitivity of selectors](https://html.spec.whatwg.org/multipage/semantics-other.html#case-sensitivity-of-selectors): attribute names on elements outside HTML compare "according to its original case".
