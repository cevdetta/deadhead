---
ruleId: "link/canonical-relative"
title: "link rel=canonical with a relative href"
description: "A relative canonical resolves against the crawled host, so staging copies point at themselves."
pubDate: "2026-09-21"
status: "avoid"
severity: "harmful"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="canonical" i]:not([href^="http://" i]):not([href^="https://" i])'
fix: { op: "none" }
replacement: "Resolve the href against the site's canonical host and emit an absolute https URL: <link rel=\"canonical\" href=\"https://example.com/post\">."
tags: ["search"]
impacts: ["seo"]
related: ["head/canonical-multiple", "link/canonical-http"]
---

A `link rel=canonical` with a relative `href` resolves against the host that serves the page. On a staging copy left open to crawlers, that host is the staging copy.

## Why avoid

Google supports relative canonicals while recommending absolute paths. A relative target resolves against the crawled host, so a staging copy left open to crawlers points at itself as canonical.

The indexed staging copy then competes with the live page. Ranking signals split across the two addresses instead of consolidating on one.

RFC 6596 permits a relative target and prints a relative example beside the absolute one. The markup is legal; the indexing outcome is the harm.

## Use instead

Emit an absolute https canonical built from the configured site host:

```html
<link rel="canonical" href="https://example.com/posts/my-post">
```

The host comes from site configuration, never from the request: a canonical built from the request preserves whatever host the crawler asked for, staging included.

## Detectability

Detectable with the selector alone. `rel` matches with `~=` because it is a space-separated token set, and each `:not` pins the `href` to an absolute http(s) form; the `i` flag folds case. A tag with no `href` also trips the rule, matching `meta/og-relative-url`; the future `link/missing-href` owns that case.

## Resources

- [Google Search Central: consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): recommends absolute paths over relative paths with `rel="canonical"`; warns that supported relative paths cause long-run harm, such as a crawled testing site inheriting itself.
- [RFC 6596: the canonical link relation](https://www.rfc-editor.org/rfc/rfc6596.txt): permits a relative target IRI and prints a relative example beside the absolute one.
- [Bing Webmaster Blog: partnering to help solve duplicate content issues](https://blogs.bing.com/webmaster/February-2009/Partnering-to-help-solve-duplicate-content-issues): documents relative or absolute URLs in `href` and treats the tag as a hint evaluated with other signals.
