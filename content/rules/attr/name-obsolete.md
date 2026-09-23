---
ruleId: "attr/name-obsolete"
title: "a, embed, img and option name"
description: "name on a, embed, img and option is obsolete; the id attribute names fragment targets now, so delete it."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a[name], embed[name], img[name], option[name]"
fix: { op: "remove-attribute", attr: "name" }
replacement: "Delete the attribute and put id on the target: <h2 id=\"part\">Part</h2>. Link to it with <a href=\"#part\">Part</a>."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["attr/charset-obsolete"]
---

`name` on `a`, `embed`, `img` and `option` names nothing resolvable. WHATWG lists the attribute as obsolete on all four elements with one replacement, the `id` attribute, so the stray name is dead weight on every element that carries it.

## Why avoid

WHATWG lists all four as obsolete with one replacement. Section 16.2 names `name` on `a`, `embed`, `img` and `option` elements as obsolete, except as noted in the previous section: use the `id` attribute instead. In earlier versions of the language the attribute named fragment targets; that job now belongs to `id` on any element. A `name` that duplicates an `id` restates it; one that stands alone names nothing resolvable.

The warning nuance changes no verdict. Section 16.1 keeps a conformance-checker warning for a non-empty `name` on anchors, distinct from the non-conforming error elsewhere. Both wordings forbid authors from writing the attribute; they differ in how much noise a checker makes. The rule reports each spelling with equal weight and lets deletion end the debate.

## Use instead

Name the target with `id` on any element:

```html
<h2 id="part">Part</h2>
<a href="#part">Part</a>
```

MDN states the same job description: the purpose of `id` is to identify a single element when linking with a fragment identifier, scripting, or styling. One unique name replaces four stray ones.

## Detectability

Complete detection. The rule matches `a[name]`, `embed[name]`, `img[name]` or `option[name]`: presence of the attribute is the whole verdict, so no logic module exists. All four alternatives name the same attribute, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `name` on `a`, `embed`, `img` and `option` elements is obsolete: use the `id` attribute instead.
- [MDN: `id`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/id): defines the unique identifier and names fragment linking as its purpose.
