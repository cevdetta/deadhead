---
ruleId: "attr/svg-version"
title: "svg version attribute"
description: "SVG 2 removed version from <svg>; it never influenced rendering or processing, so delete it."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "svg[version]"
fix: { op: "remove-attribute", attr: "version" }
replacement: "Delete the attribute: <svg viewBox=\"0 0 24 24\">."
tags: ["svg"]
impacts: ["maintainability"]
related: ["attr/svg-baseprofile", "attr/html-version", "attr/svg-xlink-href", "attr/xmlns-prefix"]
---

`<svg version="1.1">` states which edition of SVG the drawing conforms to. SVG 2 removed
the attribute, and it never did anything a renderer acts on. It arrives in HTML with every
icon pasted in from an editor's export.

## Why avoid

SVG 1.1 defined `version` on `<svg>` to state "the SVG language version to which this
document fragment conforms", fixed at `1.0` in SVG 1.0 and `1.1` after. SVG 2 took it out:
its Changes appendix lists "Removed the baseProfile and version attributes from the 'svg'
element" under the Document Structure chapter. MDN states what the attribute did while it
existed: it "is purely advisory and has no influence on rendering or processing."

Inline in an HTML page, the claim is also wrong. Browsers render the drawing by current
SVG rules whatever the attribute says, and each pasted copy of the icon carries the dead
bytes again.

## Use instead

Delete the attribute:

```html
<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M4 12h16"/>
</svg>
```

## Detectability

Detectable with the selector alone. `svg[version]` matches the root `<svg>`, where SVG 1.1
put the attribute, and a nested one, where MDN says it was never allowed.

The fix removes the attribute. With "no influence on rendering or processing", deleting
it changes nothing a browser draws or runs. The CLI and the ESLint plugin report and fix;
the bookmarklet reports without a fix, having no source text. `baseProfile`, removed in the
same line of the Changes appendix, has its own rule so that each keeps an autofix.

## Resources

- [SVG 2 Appendix K.2.6: Document Structure chapter changes](https://www.w3.org/TR/SVG2/changes.html#structure): W3C Candidate Recommendation, 2018-10-04; "Removed the baseProfile and version attributes from the 'svg' element".
- [SVG 1.1 (Second Edition) §5.1.2: The 'svg' element](https://www.w3.org/TR/SVG11/struct.html#SVGElementVersionAttribute): `version` "Indicates the SVG language version to which this document fragment conforms".
- [MDN: version](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/version): "purely advisory and has no influence on rendering or processing", and marked deprecated.
