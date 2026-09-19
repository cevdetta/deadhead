---
ruleId: "meta/apple-mobile-web-app-status-bar-style"
title: "meta name=\"apple-mobile-web-app-status-bar-style\""
description: "Apple switch for the status bar of full-screen Home Screen apps; theme-color styles browser UI on current engines."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="apple-mobile-web-app-status-bar-style" i]'
fix: { op: "remove-element" }
replacement: "Delete it. Style browser UI with <meta name=\"theme-color\" content=\"#226DAA\">."
tags: ["head", "meta", "mobile"]
impacts: ["maintainability"]
related: ["meta/apple-mobile-web-app-capable", "meta/apple-mobile-web-app-title"]
---

`<meta name="apple-mobile-web-app-status-bar-style">` styles the status bar of a full-screen Home Screen app. No other browser acts on the switch. You style browser UI with theme-color.

## Why avoid

Apple defined the switch for full-screen Home Screen apps and marks it an Apple extension. It takes three values, `default`, `black`, and `black-translucent`. It has no effect without the full-screen switch beside it.

The sibling rule drops that full-screen switch for the manifest. A switch with no trigger adds bytes and styles nothing.

WebKit gives theme-color the status-bar job on iOS 15 and later. The HTML Standard names theme-color a standard metadata name for UI color. You set theme-color per page and drop the old switch.

## Use instead

Delete the element. Ship theme-color:

```html
<meta name="theme-color" content="#226DAA">
```

## Detectability

Detectable with one selector. Deadhead reports each `meta` with that name and skips pages without such an element. The match uses `=` with the `i` flag: `name` holds a single value, not a token set.

The fix drops the element. You keep theme-color as the single source for UI color. On iOS below 15, a full-screen Home Screen app loses black status-bar styling; theme-color covers iOS 15 and later.

## Resources

- [Apple Developer: Supported Meta Tags (Safari HTML Reference, archived)](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html): Apple defines the tag as an Apple extension with three values and no effect without full-screen mode.
- [WebKit blog: New WebKit Features in Safari 15 (October 2021)](https://webkit.org/blog/11989/new-webkit-features-in-safari-15/): WebKit supports theme-color in meta and manifest, and theme-color changes the status bar color on iOS 15.
- [HTML Standard: meta theme-color](https://html.spec.whatwg.org/multipage/semantics.html#meta-theme-color): theme-color is a standard metadata name for a color browsers use to customize surrounding UI.
