---
ruleId: "attr/rev-urn"
title: "a and link rev and urn"
description: "rev and urn on a and link are obsolete; rel with an opposite term replaces rev and href replaces urn, so delete them."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "a[rev], link[rev], a[urn], link[urn]"
fix: { op: "remove-attribute", attr: "rev" }
replacement: "Delete the attributes. State the relationship with rel and the identifier with href: <a href=\"doc.html\" rel=\"author\">doc</a>."
tags: ["attr", "legacy"]
impacts: ["maintainability"]
related: ["attr/methods-obsolete"]
---

`rev` and `urn` on `a` and `link` describe nothing browsers act on. WHATWG lists both attributes as obsolete on both elements with one replacement each, opposite-term `rel` for `rev` and `href` for `urn`, so the pair is dead weight on every link that carries it.

## Why avoid

WHATWG lists all four as obsolete with one replacement each. Section 16.2 names `rev` and `urn` on `a` and `link` elements as obsolete: use `rel` with an opposite term instead of `rev` (instead of `rev="made"`, use `rel="author"`), and specify the preferred persistent identifier using `href` instead of `urn`. Neither attribute ever drove browser behavior: `rev` reversed nothing, and `urn` resolved nothing.

The W3C reference repeats each line per element. Its `a` page calls both attributes obsolete with the same two directions, and its `link` page repeats them word for word. MDN dropped `urn` from its pages outright and files `rev` under obsolete attributes on `link`. Dead attributes that three references bury in the same words are safe to delete.

## Use instead

State the reverse relationship with `rel`:

```html
<a href="doc.html" rel="author">doc</a>
```

Name the identifier with `href` and drop `urn`:

```html
<link href="urn:example:doc" rel="alternate">
```

## Detectability

Complete detection. The rule matches `a[rev]`, `link[rev]`, `a[urn]` or `link[urn]`: presence of either attribute is the whole verdict, so no logic module exists. Autofix drops `rev`; a lone `urn` or the remainder of a pair needs a hand edit, since one rule carries one fix attribute.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `rev` and `urn` on `a` and `link` elements are obsolete: opposite-term `rel` replaces `rev`, `href` replaces `urn`.
- [W3C: `a` reference](https://w3c.github.io/html-reference/a.html): both attributes obsolete on anchors with the same two directions.
- [W3C: `link` reference](https://w3c.github.io/html-reference/link.html): both attributes obsolete on links with the same two directions.
