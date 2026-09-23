---
ruleId: "meta/obsolete-name"
title: "meta name with a dead keyword"
description: "Thirty-two gist-era names that never standardized; no crawler reads them."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="subject" i], meta[name="copyright" i], meta[name="language" i], meta[name="revised" i], meta[name="topic" i], meta[name="summary" i], meta[name="classification" i], meta[name="designer" i], meta[name="reply-to" i], meta[name="owner" i], meta[name="url" i], meta[name="identifier-url" i], meta[name="directory" i], meta[name="pagename" i], meta[name="category" i], meta[name="subtitle" i], meta[name="target" i], meta[name="date" i], meta[name="search_date" i], meta[name="medium" i], meta[name="syndication-source" i], meta[name="original-source" i], meta[name="verify-v1" i], meta[name="y_key" i], meta[name="pagekey" i], meta[name="microid" i], meta[name="readability-verification" i], meta[name="icbm" i], meta[name="norton-safeweb" i], meta[name="tweetmeme-title" i], meta[name="blogcatalog" i], meta[name="apple-touch-fullscreen" i]'
fix: { op: "remove-element" }
replacement: "Delete the element. Describe the page with real content instead: <meta name=\"description\" content=\"A short, accurate, human-written summary of the page.\">."
tags: ["search"]
impacts: ["seo", "maintainability"]
related: ["meta/keywords"]
---

A `meta` name from the gist era that never standardized feeds no consumer. Thirty-two such keywords trip this rule; live names, verification tags and `rating` stay quiet.

## Why avoid

The Standard defines a closed metadata-name set. All thirty-two names were checked against the fetched WHATWG text with zero `meta name` hits: none standardized.

The registry agrees case by case. `icbm` sits as Proposal, `blogcatalog` as Incomplete proposal, and `verify-v1` as superseded legacy.

The list mixes verification tokens, geo jokes, SEO hopefuls and dead vendor hooks. Each had a moment; none has a consumer today.

Dead keywords cost bytes and review time, and the SEO-flavored ones cost hope too. Filling them feels like optimization while changing nothing.

## Use instead

Delete the element. Nothing replaces it, because nothing was being done. Describe the page for readers and crawlers with real content:

```html
<title>How to deadhead roses</title>
<meta name="description" content="A short, accurate, human-written summary of the page.">
```

## Detectability

Detectable with the selector alone. The comma lists every dead name with `=` (a single value, not a token set) and the `i` flag folds case. Anything unlisted stays quiet by construction.

## Resources

- [WHATWG HTML: semantics](https://html.spec.whatwg.org/multipage/semantics.html): the closed metadata-name set; all thirty-two names checked against the fetched text with zero `meta name` hits.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): Proposal, Incomplete and Superseded verdicts on the sampled names.
