---
ruleId: "meta/http-equiv-cache"
title: "meta http-equiv with cache values"
description: "cache-control, pragma, expires, etag, and last-modified are not pragma keywords, so browsers ignore them in meta tags; caching is driven by response headers."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv]'
match: "logic"
fix: { op: "remove-element" }
replacement: "Send Cache-Control, Expires, ETag, and Last-Modified as response headers; then delete the tag."
tags: ["head", "meta"]
impacts: ["performance", "maintainability"]
related: ["meta/http-equiv-set-cookie"]
---

`Cache-Control`, `Pragma`, `Expires`, `ETag`, and `Last-Modified` as
`<meta http-equiv>` values are cargo from the era when authors hoped the
server would turn markup into headers. No server does, and no browser
reads them: none of the five is an HTML pragma-table keyword, so all map
to no state. HTTP caching (RFC 9111) is driven by response header fields,
full stop.

## Why avoid

The tags are inert but not harmless. They are widespread — prevalence data
finds `pragma` on ~391k sites and `expires` on ~387k, all non-standard —
and each one tells the next maintainer that caching is handled here, when
it is handled (or mishandled) in headers. Even the `Pragma` header itself
is deprecated, kept only for HTTP/1.0-cache backwards compatibility; its
meta shadow never had even that role. `ETag` and `Last-Modified` as
http-equiv were already called inappropriate in Fielding's 1994 META
proposal: validators belong on responses, not in documents.

## Use instead

```http
Cache-Control: no-cache
Expires: 0
```

```http
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

## Detectability

The selector `meta[http-equiv]` is only a pre-filter: the verdict depends
on whether the trimmed value, compared ASCII case-insensitively, is one of
the five cache keywords. The decision therefore lives in
`packages/rules/logic/meta/http-equiv-cache.ts`. The fix removes the
element, following the `meta/http-equiv-x-ua-compatible` precedent:
nothing reads the tag, so deletion loses nothing.

## Resources

- [HTML Standard — Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives) — the pragma keyword table contains no cache entries; anything outside it maps to no state.
- [MDN — Pragma](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Pragma) — deprecated; HTTP/1.0-cache backwards compatibility only; use Cache-Control.
