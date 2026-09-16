---
ruleId: "head/canonical-multiple"
title: "more than one rel=canonical"
description: "A page that declares more than one canonical URL has Google ignore all of them, so its duplicate URLs stop consolidating."
pubDate: "2026-09-14"
status: "avoid"
severity: "harmful"
standardsBasis: "vendor"
detectability: "yes"
kind: "document"
scope: "any"
match: "logic"
fix: { op: "none" }
replacement: "Keep exactly one <link rel=\"canonical\"> with an absolute URL in <head>; describe other versions of the page with <link rel=\"alternate\">."
tags: ["head", "link", "seo"]
impacts: ["seo"]
related: ["link/sitemap"]
---

A page with two canonicals has none: Google ignores all of them. `<link rel="canonical">`
names the one URL that should represent a page when the same content
is reachable at several: with and without tracking parameters, and with and without a trailing
slash. `http` and `https` double it again. It only works as a single answer. Two of them
on one page cancel each other out.

## Why avoid

Google throws them all away. Its Search Central guidance is explicit: "Specify no more than
one rel=canonical for a page. When more than one is specified, all rel=canonical links will
be ignored." The page loses the one signal meant to tell Google which of its duplicate URLs
should rank. Google chooses a canonical on its own, and links pointing at the different
variants stop consolidating onto one URL.

The relation's own definition asks for one. RFC 6596, which registers `canonical`, advises:
"Specify only one canonical link relation for a resource. (It would be confusing to
consider/label/designate more than one IRI as authoritative.)"

It almost never happens on purpose. A theme emits a canonical and an SEO plugin adds another.
A CMS writes one and the layout writes one. A client-side router appends a fresh canonical
on navigation without removing the server-rendered one. The two point at different
URLs, nothing on the page looks wrong, and the first sign is a Search Console report weeks
later.

## Use instead

One canonical, with an absolute URL, in `<head>`:

```html
<link rel="canonical" href="https://example.com/dresses/green-dress">
```

**`<link rel="alternate">` is for alternative versions of a page, not a second canonical.**
Use `hreflang` for other languages and regions, and `media` for a separate mobile site:

```html
<link rel="alternate" hreflang="de" href="https://example.com/de/kleider/gruenes-kleid">
<link rel="alternate" media="only screen and (max-width: 640px)" href="https://m.example.com/dresses/green-dress">
```

Google gives the same advice: use "the appropriate link annotations to specify alternate
versions of a page", with `rel="alternate"` and `hreflang` for language and country.

## Detectability

Fully detectable, as a document rule, because a selector can't count. Once a page has two
or more `link[rel~="canonical"]`, the rule reports every one of them. Google ignores all of them,
and which to keep is the author's decision. Identical duplicates count, since the problem is
the number of declarations. A canonical in `<body>` counts too: Google wouldn't accept it on
its own, but it is still a second declaration.

There is no autofix: removing either one means choosing the canonical URL.

## Resources

- [Google Search Central Blog: 5 common mistakes with rel=canonical](https://developers.google.com/search/blog/2013/04/5-common-mistakes-with-relcanonical): "When more than one is specified, all rel=canonical links will be ignored."
- [Google Search Central: How to specify a canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): don't give different canonicals through different techniques; use `rel="alternate"` with `hreflang` for alternate versions; canonical only in `<head>`, with absolute URLs.
- [Google Search Central: Tell Google about localized versions of your page](https://developers.google.com/search/docs/specialty/international/localized-versions): the `<link rel="alternate" hreflang>` syntax.
- [RFC 6596: The Canonical Link Relation](https://www.rfc-editor.org/rfc/rfc6596#section-4): "Specify only one canonical link relation for a resource."
