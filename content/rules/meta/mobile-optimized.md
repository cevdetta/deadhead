---
ruleId: "meta/mobile-optimized"
title: "meta name=\"MobileOptimized\""
description: "Internet Explorer Mobile hint that a page suits small screens; you control small-screen layout with viewport."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="MobileOptimized" i]'
fix: { op: "remove-element" }
replacement: "Delete it. Control small-screen layout with <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">."
tags: ["mobile"]
impacts: ["maintainability"]
related: ["meta/handheld-friendly", "meta/viewport-user-scalable"]
---

`<meta name="MobileOptimized">` tells Internet Explorer Mobile the page suits a small screen. No current browser acts on the hint. You set viewport for small screens.

## Why avoid

Microsoft documented the hint for Internet Explorer Mobile. The WHATWG registry carries the name as Proposal with a Windows Mobile 6.5 doc. Proposal means no spec adopts the name.

A browser that fails to know a name skips the element. The skip costs nothing and gains nothing. The element adds bytes to each head you ship.

Microsoft itself gives viewport the layout job on Windows Phone. W3C standardizes viewport properties and parsing. You declare viewport per page and drop the old hint.

## Use instead

Delete the element. Ship viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Detectability

Detectable with one selector. Deadhead reports each `meta` with that name and skips pages without such an element. The match uses `=` with the `i` flag: `name` holds a single value, not a token set.

The fix drops the element. You keep viewport as the single source for small-screen layout.

## Resources

- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): the registry holds `MobileOptimized` as Proposal for layout control in old Internet Explorer with a Microsoft Windows Mobile 6.5 doc.
- [Microsoft Windows Developer Blog: Managing the Windows Phone Browser Viewport (March 2011)](https://blogs.windows.com/windowsdeveloper/2011/03/14/managing-the-windows-phone-browser-viewport/): Microsoft tells you to control layout width with viewport and lists `MobileOptimized` as an automatic-resize fallback trigger.
- [W3C: CSS Viewport Module Level 1](https://www.w3.org/TR/css-viewport-1/): the draft standardizes viewport `width`, `initial-scale`, and sibling properties with a parsing algorithm.
