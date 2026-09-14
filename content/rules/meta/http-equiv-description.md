---
ruleId: "meta/http-equiv-description"
title: "meta http-equiv=description"
description: "description is a name value mistakenly put in http-equiv, where it maps to no state; move the content to meta name=\"description\" so search engines can use it."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="description" i]'
fix: { op: "none" }
replacement: "Move the text to <meta name=\"description\" content=\"…\">."
tags: ["head", "meta", "seo"]
impacts: ["seo"]
related: ["meta/http-equiv-robots"]
---

`description` is a standard metadata *name* — "a free-form string that
describes the page" — that ended up in the `http-equiv` attribute, where
it is an unknown value mapping to no state. It describes nothing to
browsers or search engines.

## Why avoid

This is a mistake, not a deprecation. Google builds result snippets from
page content and "sometimes uses the `<meta name="description">` tag" when
it describes the page better, with published best practices for writing
it. The http-equiv spelling never feeds snippets: every such tag is a
missing snippet pitch, and prevalence data finds thousands of them.

Unlike its sibling `http-equiv=robots`, the cost here is a lost
opportunity rather than a silently dropped directive — hence
`unnecessary` rather than `harmful`.

## Use instead

```html
<meta name="description" content="Get everything you need to sew your next garment. Open Monday-Friday 8-5pm, located in the Fashion District.">
```

## Detectability

Fully detectable: one element, one attribute value. There is deliberately
no autofix — moving the text to the `name` attribute is a rename, and the
author should confirm the copy while moving it.

## Resources

- [HTML Standard — Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives) — description is not a pragma keyword, so the http-equiv spelling maps to no state.
- [Google Search Central — Control your snippets](https://developers.google.com/search/docs/appearance/snippet) — snippets come from page content and sometimes the `<meta name="description">` tag, with best practices for writing it.
