---
ruleId: "link/canonical-http"
title: "<link rel=\"canonical\"> with http href"
description: "An http canonical steers consolidation toward the insecure variant."
pubDate: "2026-09-21"
status: "avoid"
severity: "harmful"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="canonical" i][href^="http://" i]'
fix: { op: "none" }
replacement: "Point the tag at the https address, serve it with a valid certificate, and redirect the http URL to it: <link rel=\"canonical\" href=\"https://example.com/post\">."
tags: ["search"]
impacts: ["seo"]
related: ["link/canonical-relative", "head/canonical-multiple"]
---

A `link rel=canonical` that points at an `http://` address steers consolidation toward the insecure variant. Google prefers the https equivalent and names the http pointer a conflicting signal.

## Why avoid

Google prefers https pages over equivalent http pages as canonical. An http canonical on the page counts as a conflicting signal that blocks the https preference.

Consolidation then pools at the insecure address. Ranking signals gather there, and search results can serve the http page.

The markup itself is legal. RFC 6596 allows the target to differ in scheme, so the harm sits in the signal, not the syntax: the crawler learns the wrong address as authoritative.

## Use instead

Point the canonical at the https address and redirect the http URL to it:

```html
<link rel="canonical" href="https://example.com/post">
```

Back it with a permanent http-to-https redirect and a valid certificate; without those, the https preference cannot hold.

## Detectability

Detectable with the selector alone. `rel` matches with `~=` because it is a space-separated token set, and `href` matches with `^=` against the `http://` prefix; the `i` flag folds case. The `^=` guard needs an `href` value to match, so a missing `href` stays quiet here and trips the relative rule instead.

## Resources

- [Google Search Central: consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): prefers https pages as canonical, names an http canonical as a conflicting signal, and tells authors to avoid the practices that let http win.
- [Google Search Central Blog: indexing HTTPS pages by default](https://developers.google.com/search/blog/2015/12/indexing-https-pages-by-default): indexes the https URL unless the page carries a `rel="canonical"` to the http page, among other conditions.
- [RFC 6596: the canonical link relation](https://www.rfc-editor.org/rfc/rfc6596.txt): allows the target to differ in scheme, with heuristics as the fallback when the designation goes wrong.
