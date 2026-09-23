---
ruleId: "attr/head-profile"
title: "head profile"
description: "profile on head is unnecessary; register meta names instead and trigger behaviors with link elements."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: "head[profile]"
fix: { op: "remove-attribute", attr: "profile" }
replacement: "Delete the attribute: <head>. Register metadata names instead, and use link elements to trigger behaviors."
tags: ["structured-data"]
impacts: ["maintainability"]
related: ["attr/area-obsolete"]
---

`profile` on `head` points at nothing that reads it. WHATWG calls the attribute unnecessary with its IDL "intentionally omitted", so no implementation supports it, and the W3C version splits the replacement by intent: registered names for meta terms, `link` elements for behaviors.

## Why avoid

WHATWG buries it in one line. Section 16.2 names `profile` on `head` elements as unnecessary: omit it altogether. The IDL member is "intentionally omitted", so implementations would not support the attribute at all. A `profile` URI that names a metadata vocabulary changes nothing about how the page parses; one that names a behavior profile triggers nothing.

The W3C version splits the replacement by intent. Where the attribute declares which meta terms the document uses, it is unnecessary: omit it and register the names. Where it triggers specific user-agent behaviors, use a `link` element instead. Either intent has a live mechanism; the attribute serves neither.

## Use instead

Drop the attribute and register the names the metadata uses:

```html
<head>
  <meta name="author" content="Example">
</head>
```

Trigger behaviors with link elements:

```html
<link href="behaviors.css" rel="stylesheet">
```

## Detectability

Complete detection. The rule matches `head[profile]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `profile` on `head` is unnecessary with its IDL "intentionally omitted".
- [W3C HTML5: Obsolete features](https://www.w3.org/TR/2014/REC-html5-20141028/obsolete.html): unnecessary for declaring meta terms with names registered instead, and `link` for behaviors.
