---
ruleId: "link/rel-import"
title: "link rel=import"
description: "A Chrome-alone component loader removed in Chrome 80; no other engine ever shipped it."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="import" i]'
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the tag, or only the keyword when rel also holds live ones. Ship the component through ES modules and v1 custom elements instead."
tags: ["web-components"]
impacts: ["maintainability"]
related: ["link/rel-subresource"]
---

A `link rel=import` promises component delivery and delivers nothing. Chrome removed HTML Imports in version 80 with the rest of Web Components v0.

## Why avoid

Chrome 80 removed Web Components v0 with HTML Imports named among them. No other engine ever shipped the token: Chrome carried it alone from 2014, then dropped it in 2020.

The v0 draft never became a shared standard. The WHATWG supported-tokens list for `link` holds a dozen relations with no `import` among them.

A tag promising delivery while delivering nothing is worse than absent. The component the page wants never loads, and the reader assumes the loader story is handled.

## Use instead

ES modules with v1 custom elements:

```html
<script type="module" src="/components/my-el.js"></script>
```

## Detectability

Detectable with the selector alone. `rel` matches with `~=` because it is a space-separated token set, and the `i` flag folds case. No engine ships support for the token, so every match trips the rule.

## Resources

- [Chrome: deprecations and removals in Chrome 80](https://developer.chrome.com/blog/chrome-80-deps-rems): Web Components v0 removed, HTML Imports named, with intent links.
- [web.dev: HTML Imports](https://web.dev/articles/imports): carries the deprecation banner (removed from Chrome, February 2020) atop the original 2013 announcement.
- [WHATWG HTML: the link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): the supported-tokens list names a dozen relations with no `import` among them.
