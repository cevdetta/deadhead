---
ruleId: "meta/handheld-friendly"
title: "<meta name=\"HandheldFriendly\">"
description: "Early hint that a page suits small screens; you control small-screen layout with viewport."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="HandheldFriendly" i]'
fix: { op: "remove-element" }
replacement: "Delete it. Control small-screen layout with <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">."
tags: ["mobile"]
impacts: ["maintainability"]
related: ["meta/mobile-optimized", "meta/viewport-user-scalable"]
---

`<meta name="HandheldFriendly">` tells an old phone browser the page suits a small screen. No current browser acts on the hint. You set viewport for small screens.

## Why avoid

BlackBerry documented the hint for its browser. The WHATWG registry carries the name as Proposal and marks the vendor spec as obsolete. Proposal means no spec adopts the name.

A browser that fails to know a name skips the element. The skip costs nothing and gains nothing. The element adds bytes to each head you ship.

You own small-screen layout with viewport. Apple documents viewport width for phone pages. W3C standardizes viewport properties and parsing. You declare viewport per page and drop the old hint.

## Use instead

Delete the element. Ship viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Detectability

Detectable with one selector. Deadhead reports each `meta` with that name and skips pages without such an element. The match uses `=` with the `i` flag: `name` holds a single value, not a token set.

The fix drops the element. You keep viewport as the single source for small-screen layout.

## Resources

- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): the registry holds `HandheldFriendly` as Proposal for the BlackBerry browser with a vendor spec the registry marks as obsolete.
- [Apple Developer: Configuring the Viewport (Safari Web Content Guide)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/UsingtheViewport/UsingtheViewport.html): Apple tells you to set viewport width with `width=device-width` for pages built for phones.
- [W3C: CSS Viewport Module Level 1](https://www.w3.org/TR/css-viewport-1/): the draft standardizes viewport `width`, `initial-scale`, and sibling properties with a parsing algorithm.
