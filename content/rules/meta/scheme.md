---
ruleId: "meta/scheme"
title: "meta scheme attribute"
description: "A scheme qualifier on meta naming the format of the content value; the HTML Standard lists it as non-conforming, so authors must not use it."
pubDate: "2026-09-16"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[scheme]'
fix: { op: "remove-attribute", attr: "scheme" }
replacement: "Drop the scheme qualifier and keep the name/content pair."
tags: ["head", "meta", "legacy"]
impacts: ["maintainability"]
related: []
---

`<meta scheme>` is dead: user agents are encouraged to ignore it. Drop the qualifier and keep the `name`/`content` pair.

## Why avoid

The HTML Standard lists `scheme` on `meta` as non-conforming and tells authors not to use it.

User agents are encouraged to ignore it, so it has no effect in browsers.

Validators flag it as a conformance error, so it adds noise to validation.

No browser reads it; the Dublin Core pattern it served lives outside browsers.

## Use instead

Drop the qualifier and keep the pair:

```html
<meta name="identifier" content="1580081754">
```

Fold the scheme into the `content` value where a reader needs the format.

## Detectability

The rule catches each case. It reports each `meta` with a `scheme` attribute, and skips all else.

Matching tests presence alone: any `scheme` value trips the rule, whatever the string.

The fix removes the `scheme` attribute and the whitespace before it. The `name`/`content` pair stays, so the metadata survives.

## Resources

- [WHATWG HTML: scheme on meta](https://html.spec.whatwg.org/multipage/obsolete.html#attr-meta-scheme): lists the attribute as non-conforming for authors and gives the one-scheme-per-field guidance.
- [MDN: HTMLMetaElement.scheme](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMetaElement/scheme): badges the property Deprecated, tells authors not to use it on new pages, and cites the WHATWG section.
- [W3C HTML5: meta](https://www.w3.org/TR/2011/WD-html-markup-20110113/meta.html): calls the scheme attribute obsolete and quotes the make-the-scheme-declaration-part-of-the-value guidance.
