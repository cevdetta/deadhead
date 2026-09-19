---
ruleId: "meta/revisit-after"
title: "meta name=\"revisit-after\""
description: "A crawl-schedule hint that search engines ignore; recrawl timing comes from sitemaps, not markup."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="revisit-after" i]'
fix: { op: "remove-element" }
replacement: "Delete the element and publish change timing in an XML sitemap."
tags: ["head", "meta", "seo"]
impacts: ["seo", "maintainability"]
related: ["meta/keywords"]
---

`<meta name="revisit-after">` tells crawlers when to come back. No crawler listens: Google states that its fleet ignores the tag, and the extension registry traces support to one engine that never found broad use. The HTML Standard never mentions the name, so change timing belongs in the sitemap instead.

## Why avoid

Google names the tag and states that crawlers ignore it. Advice against it comes from the operator of the largest crawl fleet, not from SEO folklore.

The WHATWG wiki row for the name reports one supporting engine in history, one that never found broad use, and sums the tag up as "nothing more than a good luck charm".

The name sits outside the HTML Standard, which never mentions it, and outside the names MDN documents.

Crawlers read change timing from sitemaps through `lastmod` and `changefreq`. A hint they skip duplicates a channel they check, and the two drift apart with no warning.

## Use instead

Delete the element. State change timing in the sitemap:

```xml
<url>
  <loc>https://example.com/guide</loc>
  <lastmod>2026-09-18</lastmod>
  <changefreq>weekly</changefreq>
</url>
```

## Detectability

Detectable with one selector. The rule matches `meta` elements whose `name` is `revisit-after`, with the `i` flag for case variants. `=` fits because `name` holds a single value, not a token set.

## Resources

- [Google Search Central Blog: meta tags and web search (December 2007)](https://developers.google.com/search/blog/2007/12/answering-more-popular-picks-meta-tags): Google names `revisit-after` as ignored by crawlers and points authors to XML sitemaps with `lastmod` and `changefreq`.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): the extension registry row reports one supporting engine in history and sums the tag up as a "good luck charm".
- [HTML Standard: semantics](https://html.spec.whatwg.org/multipage/semantics.html#other-metadata-names): never mentions the name, so it sits outside the standard metadata names.
- [MDN: meta name](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name): standard names plus common extension names with no `revisit-after`.
