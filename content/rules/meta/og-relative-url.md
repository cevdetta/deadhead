---
ruleId: "meta/og-relative-url"
title: "Open Graph URL that isn't absolute"
description: "og:url, og:image, og:video and og:audio must be absolute http(s) URLs; a relative or scheme-less value isn't a URL to the crawlers that build link previews."
pubDate: "2026-09-14"
status: "avoid"
severity: "harmful"
standardsBasis: "community"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[property="og:url" i]:not([content^="http://" i]):not([content^="https://" i]), meta[property="og:image" i]:not([content^="http://" i]):not([content^="https://" i]), meta[property="og:video" i]:not([content^="http://" i]):not([content^="https://" i]), meta[property="og:audio" i]:not([content^="http://" i]):not([content^="https://" i])'
match: "logic"
fix: { op: "none" }
replacement: "Write the full URL: <meta property=\"og:image\" content=\"https://example.com/cover.jpg\">, not /cover.jpg or //cdn.example.com/cover.jpg."
tags: ["social"]
impacts: ["seo"]
related: ["head/canonical-multiple", "meta/twitter"]
---

A relative `og:image` points nowhere. `<meta property="og:image" content="/images/cover.jpg">`
looks correct from inside the site:
the path resolves and the file exists. But Open Graph values aren't read
by a browser on your page. They're read by a scraper that fetched your HTML to build a link
preview somewhere else, and to that scraper `/images/cover.jpg` doesn't point anywhere.

## Why avoid

The protocol defines these values as absolute URLs. The Open Graph protocol's type table says
a URL is "All valid URLs that utilize the http:// or https:// protocols". Its machine-readable
schema gives the type as "a string of Unicode characters forming a valid URL having the http
or https scheme", and assigns it to `og:url`, `og:image`, `og:video` and `og:audio`. A path like
`/cover.jpg`, a bare `cover.jpg`, or a scheme-less `//cdn.example.com/cover.jpg` is not a value
of that type.

`og:url` is the object's identity: Open Graph defines it as "the canonical URL
of your object that will be used as its permanent ID in the graph", and Facebook's webmaster
guide calls it "the canonical URL for your page". A relative ID means nothing outside the
document it was written in, so shares of the same page stop being recognised as one object.

A consumer that follows the protocol has nothing to resolve a relative value against, so it
treats it as invalid or absent. The share card appears without its image or video, or with
one the scraper guessed. It fails silently: the page looks fine in every browser, and the broken
card only shows up when someone shares the link. No platform documents how it handles
an invalid value. A site that ships relative values is relying on leniency nobody promised.
Facebook's Sharing Debugger shows "which meta tags the crawler scrapes as well as any errors or
warnings" for a given URL.

## Use instead

```html
<meta property="og:url" content="https://example.com/posts/my-post">
<meta property="og:image" content="https://example.com/images/cover.jpg">
```

Build them from the site's origin when the page is rendered. In JavaScript, use
`new URL(path, "https://example.com")`.

## Detectability

Fully detectable. The rule picks out the four URL-typed base properties whose `content`
doesn't already begin with `http://` or `https://`. The logic then trims surrounding whitespace
and reports any value that still doesn't. A missing `content` is reported too. Structured variants such as
`og:image:secure_url` share the type but aren't covered, and neither is the common
`name="og:image"` mistake.

There is no autofix: making a value absolute needs the site's origin, which the markup
doesn't carry.

## Resources

- [The Open Graph protocol: Types](https://ogp.me/#types): URL: "All valid URLs that utilize the http:// or https:// protocols"; `og:url` as the object's permanent ID.
- [Open Graph schema: ogp.me.ttl](https://ogp.me/ns/ogp.me.ttl): `ogc:url`, "a valid URL having the http or https scheme", as the range of `og:url`, `og:image`, `og:video` and `og:audio`.
- [Meta for Developers: A Guide to Sharing for Webmasters](https://developers.facebook.com/docs/sharing/webmasters): `og:url` is the page's canonical URL; the Sharing Debugger shows what the crawler scrapes and its errors.
