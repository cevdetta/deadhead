---
ruleId: "attr/svg-xlink-href"
title: "SVG xlink:href"
description: "xlink:href is deprecated since SVG2; write plain href, which browsers read without the XLink namespace or its declaration."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a, animate, animatemotion, animatetransform, feimage, filter, image, lineargradient, mpath, pattern, radialgradient, script, set, textpath, use"
match: "logic"
fix: { op: "none" }
replacement: "Write plain href: <use href=\"#icon\"></use>. Keep xlink:href beside it while old viewers matter; then drop the namespaced spelling."
tags: ["media"]
impacts: ["maintainability"]
related: ["element/plugin-embed"]
---

`xlink:href` names a reference the browser reads through a retired namespace. SVG2 labels the XLink-namespace spelling deprecated in favor of plain `href`, and readers honor the plain value wherever both are present, so the namespaced token is debt on every element that carries it.

## Why avoid

SVG2 retires the namespaced spelling outright. Section 16.1.6 states the XLink-namespace usage is now deprecated and URL references should use `href` without a namespace. The same section sets precedence: where `href` is present in both namespaces the value without a namespace shall be used and the XLink one shall be ignored. Legacy `xlink:href` is processed if no such `href` exists on the element, and skipped otherwise. A conforming generator must generate `href` without a namespace, though it keeps the XLink spelling for backwards compatibility.

The cost is namespace debt. Each `xlink:href` in XML content demands an explicit XLink namespace declaration, and each dual-spelling element states its reference twice while readers honor the plain spelling. The namespaced token still resolves today, so the verdict stays `deprecated`: nothing breaks, though every copy teaches the retired spelling to the next author.

## Use instead

Write the reference without a namespace:

```html
<svg viewBox="0 0 10 10">
  <defs><circle id="dot" r="4"/></defs>
  <use href="#dot"></use>
</svg>
```

Where old viewers must keep working, carry both spellings with matching values while the migration runs:

```html
<use href="#dot" xlink:href="#dot"></use>
```

The plain value wins wherever both are present, so the pair behaves as one reference. Drop the namespaced token once the old viewers are gone.

## Detectability

Complete detection. The rule pre-filters with the fifteen SVG elements that take the attribute, lowercased for the selector grammar: no `[xlink:href]` spelling exists, since a colon cannot appear in the subset. The verdict depends on exact attribute presence, so the decision lives in `packages/rules/logic/attr/svg-xlink-href.ts`. A plain `href` alone never trips the rule, and HTML `a` and `script` collide by tag name with no namespace on the port, so a stray namespaced reference there trips it too.

There is no autofix. Renaming the attribute changes addressing while deleting it breaks the reference, so no subtract op is safe. Rewrite the reference by hand.

## Resources

- [SVG2: Deprecated XLink URL reference attributes](https://www.w3.org/TR/SVG2/linking.html): the XLink-namespace usage is now deprecated in favor of `href` without a namespace; where both are present the plain value wins and the XLink one is ignored.
- [SVG2: Processing of URL references](https://www.w3.org/TR/SVG2/linking.html): legacy `xlink:href` is processed if no such `href` exists on the element, and skipped otherwise, and generators must emit the plain spelling.
- [MDN: `xlink:href`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/xlink:href): badges the attribute Deprecated, calls for `href` since SVG 2 removed the need for the namespace, and lists the fifteen elements that take it.
