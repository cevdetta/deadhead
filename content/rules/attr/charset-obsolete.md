---
ruleId: "attr/charset-obsolete"
title: "a and link charset"
description: "charset on a and link is obsolete; the linked resource declares its own encoding, so delete the attribute."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a[charset], link[charset]"
fix: { op: "remove-attribute", attr: "charset" }
replacement: "Delete the attribute: <a href=\"page.html\">text</a>. The linked resource declares its encoding through its own HTTP Content-Type header."
tags: ["charset", "hyperlinks"]
impacts: ["maintainability"]
related: ["attr/a-coords-shape"]
---

`charset` on `a` and `link` declares nothing the resource does not declare itself. WHATWG lists the attribute as obsolete on both elements with one replacement, an HTTP `Content-Type` header on the linked resource, so the hint is dead weight on every link that carries it.

## Why avoid

WHATWG lists both as obsolete with one replacement. Section 16.2 names `charset` on `a` elements and `charset` on `link` elements as obsolete: use an HTTP `Content-Type` header on the linked resource instead. The hint never controlled anything the server did not already declare; documents and their resources negotiate encoding through headers and in-document declarations, not through the linking page guessing at it.

MDN repeats the call on both elements. The `a` page puts `charset` under deprecated attributes: it hinted at the encoding of the linked URL, is deprecated, and should not be used by authors, with the HTTP `Content-Type` header on the linked URL as the replacement. The `link` page puts it under obsolete attributes with the same direction: use the `Content-Type` HTTP header on the linked resource. A `charset` value that disagrees with the resource header loses; one that agrees restates it. Either way the attribute decides nothing.

## Use instead

Drop the hint and let the resource speak for itself:

```html
<a href="page.html">text</a>
<link href="main.css" rel="stylesheet">
```

The linking page declares its own encoding once, in the usual place:

```html
<meta charset="utf-8">
```

## Detectability

Complete detection. The rule matches `a[charset]` or `link[charset]`: presence of the attribute is the whole verdict, so no logic module exists. Both alternatives name the same attribute, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `charset` on `a` and `link` elements is obsolete: use an HTTP `Content-Type` header on the linked resource instead.
- [MDN: `<a>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a): `charset` sits under deprecated attributes with a note not to use it and to send the HTTP `Content-Type` header on the linked URL.
- [MDN: `<link>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link): `charset` sits under obsolete attributes with the same header direction.
