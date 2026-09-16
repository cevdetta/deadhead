---
ruleId: "meta/http-equiv-robots"
title: "meta http-equiv=robots"
description: "robots is a name value mistakenly put in http-equiv, where it maps to no state and does nothing; a noindex written here is silently ignored."
pubDate: "2026-09-14"
status: "avoid"
severity: "harmful"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="robots" i]'
fix: { op: "none" }
replacement: "Move crawling rules to a robots.txt file in the server root; for page-level indexing use <meta name=\"robots\">. Never disallow the same URL in robots.txt."
tags: ["head", "meta", "seo"]
impacts: ["seo"]
related: ["meta/http-equiv-description"]
---

A `robots` in `http-equiv` reaches no crawler. `robots` is a metadata *name* that
ended up in the `http-equiv` attribute,
where it is an unknown value mapping to no state. Crawlers read
page-level directives from `<meta name="robots">` or the `X-Robots-Tag`
header.

## Why avoid

This is a harmful mistake: directives vanish silently. An author who wrote
`http-equiv="robots" content="noindex"` believes the page is excluded from
results; it is not. The tag must move, not merely change shape: crawling
rules belong in `/robots.txt` at the service root, page-level indexing
rules in `<meta name="robots">`.

And the move has its own trap, which the replacement carries deliberately:
robots.txt governs *crawling*, not exclusion. Google's guidance is that
robots.txt "is not a mechanism for keeping a web page out of Google". To
keep a page out, use noindex. A noindex only works if the page isn't
blocked in robots.txt, because a blocked page is never fetched and its
noindex never seen. Disallow in robots.txt or noindex in the page, never
both on the same URL.

## Use instead

```http
User-Agent: *
Disallow: /private/
```

```html
<meta name="robots" content="noindex">
```

## Detectability

Fully detectable: one element, one attribute value. There is deliberately
no autofix: moving the value to the `name` attribute is a rename, and an
automated rename of a silently-dropped indexing directive is exactly the
kind of edit a human should confirm.

## Resources

- [Google Search Central: Robots meta tag and X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag): page-level directives live in `<meta name="robots">` or the X-Robots-Tag header; documents noindex semantics and the robots.txt interaction.
- [RFC 9309: Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.txt): crawling rules "MUST be accessible in a file named /robots.txt (all lowercase) in the top-level path of the service."
- [HTML Standard: Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives): robots is not a pragma keyword, so the http-equiv spelling maps to no state.
