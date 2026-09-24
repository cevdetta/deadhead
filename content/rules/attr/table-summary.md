---
ruleId: "attr/table-summary"
title: "<table summary>"
description: "summary on table is obsolete and never rendered, so sighted readers never get the description. Put the text in a caption."
pubDate: "2026-09-24"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "table[summary]"
fix: { op: "none" }
replacement: "Move the text into the table's <caption>, or into prose or a figcaption next to the table, then delete the attribute."
tags: ["tables"]
impacts: ["a11y"]
related: ["attr/table-presentational"]
---

`summary` on `table` carried a description of the table that no browser renders. `<table summary="Two plans and their monthly prices">` shows nothing of that text on screen. The HTML Standard makes the attribute obsolete and points to the table-description techniques instead, the first of which is a `<caption>` everyone sees.

## Why avoid

It is obsolete. The HTML Standard lists `summary` on `table` among the attributes that "are obsolete (though the elements are still part of the language), and must not be used by authors", with the instruction: "Use one of the techniques for describing tables given in the table section instead." Those techniques put the description in prose around the table, in the table's `caption`, in a `details` element inside the `caption`, or next to the table in the same `figure` or its `figcaption`. Every one of them is visible text.

The attribute is not. A description that only some software might read is one that sighted readers never get. MDN lists `summary` under the deprecated attributes of `table` with one replacement, the `<caption>` element, and its accessibility section names who a caption serves: people navigating with a screen reader, people with low vision and people with cognitive concerns, who use it to decide whether to read the table or skip it.

## Use instead

Put the description in a caption:

```html
<table>
  <caption>Plans and monthly prices: two plans, priced per month in CHF</caption>
  <tbody>
    <tr><td>Pro</td><td>CHF 29</td></tr>
  </tbody>
</table>
```

A longer description fits in the caption after the title, in a `details` element inside the caption, or in a `figure` whose `figcaption` holds both. The W3C WAI tables tutorial shows each pattern, and notes that `aria-describedby` has weaker assistive technology support than a caption.

## Detectability

Complete detection. The rule matches `table[summary]`: presence of the attribute is the whole verdict. There is no autofix: deleting the attribute throws the description away, and moving it into a `<caption>` adds markup, which a fix never does. A person has to decide where the text goes.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `summary` on `table` is obsolete; use one of the techniques for describing tables instead.
- [HTML Standard: Techniques for describing tables](https://html.spec.whatwg.org/multipage/tables.html#table-descriptions-techniques): prose around the table, the `caption`, a `details` element inside the `caption`, or a `figure` and its `figcaption`.
- [MDN: `<table>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table): `summary` sits under deprecated attributes with `<caption>` as the replacement; the accessibility section says who a caption helps.
- [W3C WAI: Caption & Summary](https://www.w3.org/WAI/tutorials/tables/caption-summary/): a table summary goes in the `caption`, a `figure` and `figcaption`, or `aria-describedby`, the last two with weaker assistive technology support.
