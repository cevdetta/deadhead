---
ruleId: "meta/http-equiv-refresh"
title: "meta http-equiv=refresh"
description: "http-equiv=refresh moves the reader on a timer, which WCAG names as a failure and the back button cannot undo."
pubDate: "2026-09-09"
status: "avoid"
severity: "harmful"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: 'meta[http-equiv="refresh" i]'
fix: { op: "none" }
replacement: "Send a 301 or 302 from the server to move a page, or offer a visible <a href> link. Never move the reader on a timer."
tags: ["head", "meta", "a11y"]
impacts: ["a11y", "seo", "security"]
related: ["meta/http-equiv-x-ua-compatible"]
---

`http-equiv="refresh"` is a pragma directive that tells the browser to reload the
document, or fetch a different one, after a delay. It predates HTTP redirects being
something an author could reach for: on early hosting you often could not set a response
header, and a `<meta>` tag was the only lever available. That constraint is long gone,
but the tag survives in redirect pages, "you are being forwarded" interstitials and
dashboards that reload themselves.

## Why avoid

A timed refresh is an accessibility failure, not a matter of taste. WCAG 2.2 success
criterion 2.2.1 requires that a time limit be adjustable, extendable or switchable off,
and technique F40 names this exact construct as a way of failing it. Anyone who needs
longer with the page — a screen-reader user working through it linearly, someone using
a switch device, anyone reading in a second language — is pulled away mid-task with no
control. Criterion 2.2.4 covers the interruption itself.

It also breaks the back button. A refresh-redirect leaves an entry in session history,
so going back re-runs the refresh and throws the reader forward again: the page becomes
a trap that ordinary browser navigation cannot escape.

And it is the wrong layer. A `301` or `302` is unambiguous to caches, crawlers and
clients, and happens before anything is rendered. A `<meta>` refresh is a claim the
document makes about itself *after* it has already been fetched, parsed and painted —
which is why search engines treat it inconsistently, and why it has been a staple of
cloaking and phishing kits for two decades.

The zero-delay form, `content="0;url=…"`, is **not** a 2.2.1 failure — there is no time
limit to adjust — but it keeps every other problem above, so this rule reports it too.

## Use instead

To move a page, redirect at the server, before the document is sent:

```
HTTP/1.1 301 Moved Permanently
Location: https://example.com/new-page
```

To offer onward navigation, say so and let the reader choose:

```html
<p>This page has moved. <a href="/new-page">Continue to the new page</a>.</p>
```

If a view genuinely must poll, fetch the data and update the DOM in place, so the
reader's scroll position, focus and history stay where they were.

## Detectability

Fully detectable: one element identified by one attribute value, with no context that
changes the verdict. It is scoped to the whole document rather than to `<head>`, because
a pragma directive takes effect when the element is inserted, so a `<meta
http-equiv="refresh">` in `<body>` redirects exactly the same way — scoping it to the
head would miss working redirects.

The fix is deliberately `none`. The other removable rules delete inert markup; this
element is doing something, and deleting it silently changes where the page goes. The
repair is to move the behaviour to the server or to a link, and no text edit can do
that.

## Resources

- [WCAG 2.2 — 2.2.1 Timing Adjustable](https://www.w3.org/TR/WCAG22/#timing-adjustable) — normative: a time limit must be adjustable, extendable, or able to be turned off.
- [WCAG technique F40 — failure due to using meta redirect with a time limit](https://www.w3.org/WAI/WCAG22/Techniques/failures/F40) — names this construct directly as a failure of 2.2.1.
- [MDN — `<meta>`: `http-equiv="refresh"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta) — behaviour, and the session-history caveat.
