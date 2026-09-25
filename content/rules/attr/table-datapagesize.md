---
ruleId: "attr/table-datapagesize"
title: "<table datapagesize>"
description: "datapagesize on table is unnecessary; omit it altogether."
pubDate: "2026-09-21"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "table[datapagesize]"
fix: { op: "remove-attribute", attr: "datapagesize" }
replacement: "Delete the attribute: <table><tr><td>Cell</td></tr></table>."
tags: ["tables"]
impacts: ["maintainability"]
related: ["attr/table-presentational"]
---

`datapagesize` on `table` decides nothing. WHATWG calls the attribute unnecessary with one direction, omit it altogether, since the table renders its rows with or without the hint.

## Why avoid

WHATWG buries it in one line. Section 16.2 names `datapagesize` on `table` elements as unnecessary: omit it altogether. The standard maps `cellpadding`, `cellspacing`, `width`, border widths and alignment to presentational hints, and this hint appears in none of those mappings. Its interface entry is missing too: the `HTMLTableElement` partial interface carries `align`, `border`, `frame`, `rules`, `summary`, `width`, `bgColor`, `cellPadding` and `cellSpacing`, and no `datapagesize` member. A `datapagesize="20"` that states one page size and a `datapagesize="5"` that states another both ask the browser for pagination it never performs.

The W3C Recommendation prints the same line. Its obsolete-features chapter names `datapagesize` on `table` as unnecessary with the same direction, omit it altogether. Two publications, one verdict: the attribute is dead weight on every table that carries it.

## Use instead

Delete the attribute and keep the table:

```html
<table>
  <tr><td>Cell</td></tr>
</table>
```

## Detectability

Complete detection. The rule matches `table[datapagesize]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder. Tables live in `body`, so the scope confines the walk to that half.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `datapagesize` on `table` is unnecessary: omit it altogether.
- [WHATWG: Requirements for implementations](https://html.spec.whatwg.org/multipage/obsolete.html#other-elements,-attributes-and-apis): the `HTMLTableElement` partial interface carries nine reflective members and no `datapagesize`.
- [W3C: HTML5 Obsolete features](https://www.w3.org/TR/2014/REC-html5-20141028/obsolete.html#non-conforming-features): `datapagesize` on `table` is unnecessary: omit it altogether.
