---
ruleId: "meta/http-equiv-x-robots-tag"
title: "meta http-equiv=X-Robots-Tag"
description: "X-Robots-Tag is a response-header name, not a pragma keyword; in a meta tag it reaches no crawler, so delete it."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="x-robots-tag" i]'
fix: { op: "remove-element" }
replacement: "Delete the tag. For page-level indexing use <meta name=\"robots\" content=\"noindex\">; for non-HTML resources send X-Robots-Tag as a response header."
tags: ["http-equiv", "search"]
impacts: ["seo"]
related: ["meta/http-equiv-robots", "meta/http-equiv-header-only-pragmas"]
---

`X-Robots-Tag` names an HTTP response header. Placed in `http-equiv`,
it reaches no crawler: the pragma table holds no such keyword, so the
tag maps to no state and browsers skip it. Google documents two working
syntaxes, `<meta name="robots">` in markup and `X-Robots-Tag` in the
header, and no third one.

## Why avoid

Directives in this form vanish without a trace. An author who wrote
`http-equiv="X-Robots-Tag" content="noindex"` expects the page out of
results; the page stays indexed, its links stay followed. The tag costs
bytes and review attention while granting zero control over crawling or
indexing.

Its sibling `meta/http-equiv-robots` covers the bare `robots` spelling
with severity `harmful` and fix `none`: that spelling sits one attribute
rename from working markup, so resolving it needs a human. This spelling
has no such near-miss, since `name="X-Robots-Tag"` is not valid markup
either. Deletion is safe here, and dead weight is the right verdict.

## Use instead

For HTML pages, the meta name form:

```html
<meta name="robots" content="noindex">
```

For non-HTML resources such as PDFs or images, the response header:

```http
X-Robots-Tag: noindex
```

Never pair a page-level `noindex` with a robots.txt disallow of the same
URL: a disallowed page is never fetched, so its `noindex` is never seen.

## Detectability

Complete detection. The rule matches `http-equiv="x-robots-tag"` with
the `i` flag: one selector branch is the whole rule, and the fix always
removes the element. Deletion alters no crawler behavior, because no
crawler reads the tag in this form.

## Resources

- [Google Search Central: robots meta tag, data-nosnippet, and X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag): page-level settings go in a meta tag on HTML pages (each example uses `<meta name="robots">`) or in an HTTP header; `X-Robots-Tag` is an element of the HTTP header response.
- [MDN: `<meta name="robots">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/robots): the in-document form is `<meta name="robots">`; Google, Yahoo, and Bing support the directives in the `X-Robots-Tag` HTTP header.
- [MDN: X-Robots-Tag header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Robots-Tag): typed as a response header; indexing rules live in that header or in a robots meta element.
- [WHATWG HTML: pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-http-equiv): the closed pragma set has no entry for `x-robots-tag`, so the `http-equiv` spelling maps to no state.
