---
ruleId: "meta/news-keywords"
title: "<meta name=\"news_keywords\">"
description: "A Google News keyword list the crawler stopped reading in 2017."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="news_keywords" i]'
fix: { op: "remove-element" }
replacement: "Delete the element. Topic relevance lives in the page content, not in a hidden list: <meta name=\"description\" content=\"A short, accurate, human-written summary of the page.\">."
tags: ["search"]
impacts: ["seo", "maintainability"]
related: ["meta/keywords"]
---

A `meta name=news_keywords` is a keyword list for a consumer that left in 2017. Google announced the tag for News publishers in 2012 and stopped reading it five years later.

## Why avoid

Google announced the tag in September 2012: up to ten comma-separated phrases per article, meant to aid News classification.

Support ended without announcement. The help content vanished in 2017, John Mueller confirmed the drop in February 2018, and SearchLiaison added that Google ignores the tags outright.

The live supported-tags list names no `news_keywords`. No consumer remains on Google's side to read the list.

Like its plain twin, the tag publishes the keyword strategy to competitors in `view-source` while rotting unreviewed. Nothing reads it and no test covers it.

## Use instead

Delete the element. Nothing replaces it, because nothing was being done. Describe the page for readers and crawlers with real content:

```html
<title>How to deadhead roses</title>
<meta name="description" content="A short, accurate, human-written summary of the page.">
```

## Detectability

Detectable with the selector alone. `name` matches with `=` because it holds a single value rather than a token set, and the `i` flag folds case. No crawler reads the name, so every match trips the rule.

## Resources

- [Google News Blog: a newly hatched way to tag your news articles](https://news.googleblog.com/2012/09/a-newly-hatched-way-to-tag-your-news.html): September 2012 birth of the tag for News publishers, ten phrases, comma-separated.
- [Search Engine Roundtable: support dropped](https://www.seroundtable.com/google-news-meta-keywords-tag-no-longer-supported-25270.html): Mueller's February 2018 confirmation plus SearchLiaison's will-ignore-it note, quoted verbatim.
- [Google Search Central: meta tags Google supports](https://developers.google.com/search/docs/crawling-indexing/special-tags): the live supported list, checked against the fetched text, with zero mentions of the name.
