---
ruleId: "attr/html-version"
title: "html version"
description: "version on html is unnecessary; the doctype already declares the standard, so delete it."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "html[version]"
fix: { op: "remove-attribute", attr: "version" }
replacement: "Delete the attribute: <html lang=\"en\">. The doctype already declares HTML."
tags: ["doctype"]
impacts: ["maintainability"]
related: ["attr/html-manifest"]
---

`version` on `html` labels nothing the parser reads. WHATWG calls the attribute unnecessary with one direction, omit it altogether, since the doctype alone decides parsing and no mode ever keyed off the label.

## Why avoid

WHATWG buries it in one line. Section 16.2 names `version` on `html` elements as unnecessary: omit it altogether. The attribute once labeled which HTML version the document claimed; no parser ever switched modes on its value; the doctype alone decides parsing. A `version` value that agrees with the doctype restates it, and one that disagrees loses without warning.

The W3C version says the same with the same two words: unnecessary, omit it altogether. Markup that restates its own standard in an unread attribute teaches the next author that the label matters. It never did.

## Use instead

Drop the attribute and let the doctype speak:

```html
<!doctype html>
<html lang="en">
```

## Detectability

Complete detection. The rule matches `html[version]`: presence of the attribute is the whole verdict, so no logic module exists. The selector names the fix attribute itself, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `version` on `html` is unnecessary.
- [W3C HTML5: Obsolete features](https://www.w3.org/TR/2014/REC-html5-20141028/obsolete.html): unnecessary with the same omit direction.
