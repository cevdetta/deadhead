---
ruleId: "link/rel-subresource"
title: "link rel=subresource"
description: "A prefetch hint that lived in Chrome alone, never worked, and left a decade ago."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="subresource" i]'
fix: { op: "remove-element" }
replacement: "Drop the tag. Preload through the standard relation instead: <link rel=\"preload\" href=\"/app.js\" as=\"script\">."
tags: ["head", "link", "performance"]
impacts: ["performance"]
related: ["link/preload-as"]
---

A `link rel=subresource` promises a head start and delivers nothing. Chrome removed the token in version 50 after years of deprecation pressure.

## Why avoid

Chrome 50 removed `rel="subresource"`. The token never worked as intended: referenced resources downloaded at low priority, no browser outside Chrome ever implemented it, and the Chrome build carried a double-download bug.

It never entered any standard. The WHATWG supported-tokens list for `link` holds a dozen relations with no `subresource` among them.

A tag promising a head start while fetching nothing is worse than absent. It tells the next reader the performance story is handled, so the real preload never gets written.

## Use instead

The standardized relation, with the destination the preload rules demand:

```html
<link rel="preload" href="/app.js" as="script">
```

## Detectability

Detectable with the selector alone. `rel` matches with `~=` because it is a space-separated token set, and the `i` flag folds case. No engine acts on the token, so every match trips the rule.

## Resources

- [Chrome: API deprecations and removals in Chrome 50](https://developer.chrome.com/blog/chrome-50-deprecations): removal plus the three reasons (never worked, single-engine, double download) and the replacement options.
- [Chromium: LINK rel=subresource](https://www.chromium.org/spdy/link-headers-and-server-hint/link-rel-subresource/): deprecated, use the Preload API.
- [WHATWG HTML: the link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): the supported-tokens list names a dozen relations with no `subresource` among them.
