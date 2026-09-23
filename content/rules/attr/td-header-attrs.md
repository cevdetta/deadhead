---
ruleId: "attr/td-header-attrs"
title: "td and th header attributes"
description: "abbr, axis and scope on the wrong cells are obsolete; use th with scope and terse text instead."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "body"
selector: "td[abbr], td[axis], td[scope], th[axis]"
fix: { op: "none" }
replacement: "Mark heading cells with th and scope: <th scope=\"col\">Plan</th>. Write terse cell text with detail in title where a longer label matters."
tags: ["tables"]
impacts: ["maintainability", "a11y"]
related: ["attr/table-presentational"]
---

`abbr`, `axis` and `scope` sit on cells that cannot carry them. WHATWG lists all four spellings as obsolete, each with its own rewrite, since header association now lives in `th` with `scope`.

## Why avoid

WHATWG lists all four spellings as obsolete, each with its own rewrite. Section 16.2 names `abbr` on `td` as obsolete: use text that begins in an unambiguous and terse manner, with more elaborate text after it, and the `title` attribute where detail helps keep the cell terse; where the cell is a heading, use `th`, which keeps a live `abbr`. It names `axis` on `td` and `th` as obsolete: use the `scope` attribute on the relevant `th`. It names `scope` on `td` as obsolete: use `th` elements for heading cells. The labels date from an era when header association needed author hints on data cells; the current model puts headers in `th` and lets `scope` state their range.

MDN says the same from the element side. Its `th` page files `axis` under deprecated attributes: it holds id references for header groups, and authors should use `scope` instead. The same page documents `scope` as the live relation (`row`, `col`, `rowgroup`, `colgroup`) and `abbr` as a live short label that assistive technology announces before the content. A `td` with `scope` claims a relation the header model never grants data cells, and a `th` with `axis` states in a retired vocabulary what `scope` already says.

## Use instead

Mark headings with `th` and state their range with `scope`:

```html
<table>
  <tr><th scope="col">Plan</th><th scope="col">Price</th></tr>
  <tr><th scope="row">Basic</th><td>CHF 9</td></tr>
</table>
```

Write terse data text, with longer detail in `title` where it matters:

```html
<td title="Swiss francs per month">CHF 9</td>
```

## Detectability

Complete detection. The rule matches `td[abbr]`, `td[axis]`, `td[scope]` or `th[axis]`: presence of any of the four is the whole verdict, so no logic module exists. Cells without those spellings pass untouched. There is no autofix: each spelling wants its own rewrite, and deletion would drop the header claim without restating it.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `abbr` on `td`, `axis` on `td` and `th`, and `scope` on `td` are obsolete, each with its own rewrite.
- [MDN: `<th>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th): `axis` is deprecated in favor of `scope`, while `scope` and `abbr` are live header relations and labels.
