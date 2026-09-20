---
ruleId: "attr/methods-obsolete"
title: "a and link methods"
description: "methods on a and link is obsolete; the server answers capability questions over HTTP OPTIONS, so delete the attribute."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a[methods], link[methods]"
fix: { op: "remove-attribute", attr: "methods" }
replacement: "Delete the attribute: <a href=\"page.html\">text</a>. A client that needs the communication options sends OPTIONS to the target resource."
tags: ["attr", "legacy"]
impacts: ["maintainability"]
related: ["attr/charset-obsolete"]
---

`methods` on `a` and `link` answers a question no browser asks. WHATWG lists the attribute as obsolete on both elements with one replacement, the HTTP OPTIONS feature, so the hint is dead weight on every link that carries it.

## Why avoid

WHATWG lists both as obsolete with one replacement. Section 16.2 names `methods` on `a` elements and `methods` on `link` elements as obsolete: use the HTTP OPTIONS feature instead. The attribute once hinted which methods the linked resource supports; no browser ever constrained navigation or fetching on its value. It was documentation stapled to markup, unread by the machinery it described.

RFC 9110 defines the live channel. Section 9.3.7 states the OPTIONS method requests information about the communication options available for the target resource, which lets a client learn options and requirements without implying a resource action. A server answering OPTIONS sends header fields such as `Allow` that state implemented features for the resource. The capability question the attribute posed still has an answer; it arrives over HTTP, not in the linking page.

## Use instead

Drop the hint and let the protocol answer:

```html
<a href="page.html">text</a>
<link href="main.css" rel="stylesheet">
```

A client that needs the options asks the server:

```http
OPTIONS /page.html HTTP/1.1
Host: example.com
```

## Detectability

Complete detection. The rule matches `a[methods]` or `link[methods]`: presence of the attribute is the whole verdict, so no logic module exists. Both alternatives name the same attribute, so the single `remove-attribute` fix covers every finding with no remainder.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `methods` on `a` and `link` elements is obsolete: use the HTTP OPTIONS feature instead.
- [RFC 9110: OPTIONS](https://httpwg.org/specs/rfc9110.html): the OPTIONS method requests information about the communication options available for the target resource, with `Allow` among the answering fields.
