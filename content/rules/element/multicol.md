---
ruleId: "element/multicol"
title: "multicol element"
description: "multicol is obsolete; it was a single-vendor experiment for multi-column layout that no browser implements, so use CSS multi-column layout instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'multicol'
fix: { op: "none" }
replacement: "Lay out columns with CSS: `columns: 2` on a normal container."
tags: ["legacy", "style"]
impacts: ["maintainability"]
related: ["element/center", "element/spacer"]
---

No browser lays out `<multicol>`. `<multicol>` was an early experiment in laying out
text in newspaper-style
columns: a `cols` attribute said how many. The HTML Standard lists it under
non-conforming features with the direction "Use
appropriate elements or CSS instead".

## Why avoid

It is entirely obsolete and must not be used by authors. The experiment never
got significant traction and is not implemented in any major browser; in
Firefox the element is exposed as `HTMLUnknownElement`, which means no engine
lays out columns from it. Markup that does nothing in every browser is dead
weight that misleads the next reader into thinking the columns come from the
tag.

CSS owns this job now. CSS Multi-column Layout flows any element's content
into balanced columns: `column-count` fixes the number of columns,
`column-width` sets their optimal width, and `columns` is the shorthand for
both, with `column-gap` and `column-rule` controlling the gutters. That is
everything `multicol` promised, on every engine, without a proprietary tag.

## Use instead

A normal container with the number of columns declared in style:

```html
<div class="cols">
  <p>First column text…</p>
  <p>Second column text…</p>
</div>
```

```css
.cols { columns: 2; column-gap: 1em; }
```

## Detectability

Fully detectable. The rule matches the bare element name `multicol`; no logic
module is needed, and all three adapters agree on
closed elements.

There is no autofix. Removing the element deletes its content, and rewriting
it as a styled container is not a subtraction, so the fix op is `none`.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `multicol` is entirely obsolete; appropriate elements or CSS instead.
- [W3C CSS Multi-column Layout Module Level 1](https://www.w3.org/TR/css-multicol-1/): `column-count` fixes the number of columns, `columns` is the shorthand; the standard replacement.
- [MDN: `<multicol>` (archive mirror)](https://devdoc.net/web/developer.mozilla.org/en-US/docs/Web/HTML/Element/multicol.html): experimental, never significant traction, not implemented in major browsers; use a regular element with CSS Columns (MDN has since removed the page).
