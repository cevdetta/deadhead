---
ruleId: "link/shortcut-icon"
title: "link rel=\"shortcut icon\""
description: "shortcut is not a link relation; browsers already parse rel=\"shortcut icon\" as icon, so the token is inert."
pubDate: "2026-09-09"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="shortcut" i]'
fix: { op: "none" }
replacement: "Drop the shortcut token: <link rel=\"icon\" href=\"/favicon.ico\" sizes=\"32x32\">."
tags: ["head", "link", "favicon"]
impacts: ["maintainability"]
related: ["meta/http-equiv-x-ua-compatible"]
---

`rel="shortcut icon"` is the spelling Internet Explorer 5 introduced for the "favorites
icon" in 1999, before there was a specification for any of it. Every boilerplate of the
following decade copied it, and it is still being copied today — usually alongside a
second `<link rel="icon">` that does the same job.

## Why avoid

`shortcut` is not a link relation. The HTML Standard defines `icon` and registers the
keywords a `rel` may contain; `shortcut` is not among them. The `rel` attribute is a
space-separated set of tokens, so a browser parsing `shortcut icon` finds two tokens,
recognises `icon`, does not recognise `shortcut`, and discards it. The markup that runs
is `rel="icon"` either way.

That makes the token worse than merely redundant: it is a decision a reader has to make
and cannot resolve from the markup. The usual guess is that `shortcut` is there for old
browsers, which is backwards — Internet Explorer accepted plain `rel="icon"` too, and no
browser has ever needed the longer form. So it survives on inertia, and every copy
teaches the next author that it is required.

## Use instead

Delete the token. Nothing else about the element changes:

```html
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
```

## Detectability

Fully detectable. `~=` matches one whitespace-separated token, which is exactly how a
browser parses `rel`, so the selector agrees with the parser rather than approximating
it. The `i` flag is load-bearing: link types are ASCII case-insensitive and older
boilerplate is full of `rel="Shortcut Icon"`.

This rule ships without an automatic fix, and not because the edit is risky — it is one
of the safest available, since browsers already treat the two spellings identically. The
repair is to rewrite the attribute's *value*, and `fix.op` can currently only delete: it
offers `remove-element`, which would delete the favicon, and `remove-attribute`, which
would delete `rel` and also delete the favicon. Rewriting is proposed separately, and
`fix.op` is a mutable field, so this rule can gain a fix later without its `ruleId`
changing.

## Resources

- [HTML Standard — `rel="icon"`](https://html.spec.whatwg.org/multipage/links.html#rel-icon) — the keyword the specification actually defines, and its processing.
- [HTML Standard — link types](https://html.spec.whatwg.org/multipage/links.html#linkTypes) — the registry of permitted `rel` keywords, which `shortcut` is absent from.
- [Mathias Bynens — `rel="shortcut icon"` considered harmful](https://mathiasbynens.be/notes/rel-shortcut-icon) — the primary write-up of where the spelling came from and why it is unnecessary.
