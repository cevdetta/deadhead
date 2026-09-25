---
ruleId: "meta/page-info-names"
title: "<meta name> page-info names"
description: "Twenty-four gist-era names such as subject, copyright and icbm; no search engine or browser reads them, so they are dead weight."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "community"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="subject" i], meta[name="copyright" i], meta[name="language" i], meta[name="revised" i], meta[name="topic" i], meta[name="summary" i], meta[name="classification" i], meta[name="designer" i], meta[name="reply-to" i], meta[name="owner" i], meta[name="url" i], meta[name="identifier-url" i], meta[name="directory" i], meta[name="pagename" i], meta[name="category" i], meta[name="subtitle" i], meta[name="target" i], meta[name="date" i], meta[name="search_date" i], meta[name="medium" i], meta[name="syndication-source" i], meta[name="original-source" i], meta[name="icbm" i], meta[name="tweetmeme-title" i]'
fix: { op: "remove-element" }
replacement: "Delete the element. Describe the page with real content instead: <meta name=\"description\" content=\"A short, accurate, human-written summary of the page.\">."
tags: ["search"]
impacts: ["seo", "maintainability"]
related: ["meta/keywords", "meta/title", "meta/verification-names"]
---

A `meta` name from the gist era that never standardized feeds no consumer. Twenty-four such names describe the page, its owner or its place in the world: `subject`, `copyright`, `language`, `revised`, `topic`, `summary`, `classification`, `designer`, `reply-to`, `owner`, `url`, `identifier-url`, `directory`, `pagename`, `category`, `subtitle`, `target`, `date`, `search_date`, `medium`, `syndication-source`, `original-source`, `icbm` and `tweetmeme-title`. Live names such as `description` and `author`, and `rating`, stay quiet.

## Why avoid

The HTML Standard's predefined metadata names include none of the twenty-four; all were checked against the fetched WHATWG text with zero `meta name` hits. Its "Other metadata names" section lets anyone use an unregistered name, so a name earns its bytes only while something reads it.

Nothing does. The WHATWG MetaExtensions registry holds `icbm` as a Proposal, explained as "an old, humorous allusion" to missile coordinates, and `designer` as a Proposal too. Google's list of the meta tags it supports names none of the twenty-four, and Google states it "will ignore meta tags that it doesn't support". The list mixes geo jokes (`icbm`), SEO hopefuls (`topic`, `category`, `target`) and dead vendor hooks (`tweetmeme-title`).

Dead keywords cost bytes and review time, and the SEO-flavored ones cost hope too. Filling them feels like optimization while changing nothing.

## Use instead

Delete the element; nothing replaces it, because nothing was being done. Describe the page for readers and crawlers with real content:

```html
<title>How to deadhead roses</title>
<meta name="description" content="A short, accurate, human-written summary of the page.">
```

## Detectability

Detectable with the selector alone. The comma lists every name with `=` (a single value, not a token set) and the `i` flag folds case. Anything unlisted stays quiet by construction. The autofix deletes the element: no reader consumes any of the twenty-four, so removal changes nothing a user or crawler sees.

## Resources

- [WHATWG HTML: Other metadata names](https://html.spec.whatwg.org/multipage/semantics.html#other-metadata-names): anyone may use an unregistered name; the predefined set names none of the twenty-four, checked against the fetched text with zero `meta name` hits.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): `icbm` and `designer` sit as Proposals.
- [Google Search Central: Meta tags that Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags): none of the twenty-four is listed; "Google will ignore meta tags that it doesn't support".
