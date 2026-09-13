---
ruleId: "meta/keywords"
title: "meta name=\"keywords\""
description: "A comma-separated topic list that no major search engine ranks on, and that the HTML Standard itself warns against."
pubDate: "2026-09-10"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="keywords" i]'
fix: { op: "remove-element" }
replacement: "Delete it. Topical relevance comes from the page's own content, headings and structured data."
tags: ["head", "meta", "seo", "legacy"]
impacts: ["seo", "maintainability"]
related: ["meta/http-equiv-x-ua-compatible"]
---

In the mid-1990s a search engine had very little to go on, so it asked the page to
describe itself. `<meta name="keywords">` was that channel: a comma-separated list of the
terms a document wanted to be found under. It worked well enough to be worth lying about,
and within a few years the field was so comprehensively stuffed that engines stopped
reading it. The tag stayed in the boilerplate anyway.

## Why avoid

The unusual thing about this rule is that the specification which defines the field also
documents why it is worthless. `keywords` is a current standard metadata name in the HTML
Standard — not obsolete, not removed — and the entry defining it carries this note:

> Many search engines do not consider such keywords, because this feature has
> historically been used unreliably and even misleadingly as a way to spam search engine
> results in a way that is not helpful for users.

Both engines that matter say the same in their own words. Google published *Google does
not use the keywords meta tag in web ranking* in September 2009, stating that its web
search disregards the tag entirely; that has never been walked back. Bing's senior
product manager for webmaster outreach wrote in 2014 that the tag "flat lined years ago
as a booster" and that it is "dead in terms of SEO value".

So the element is inert, but it is not free. It is invisible to your readers and plainly
visible in `view-source` to everyone else, which means the list of terms you hope to rank
for is published to your competitors at no cost to them. And because nothing reads it,
nothing tells you when it goes stale: a hand-maintained list that no test covers and no
crawler consumes drifts away from what the page actually says immediately and silently.

## Use instead

Delete the element. Nothing replaces it, because nothing was being done.

To describe a page to a search engine or a social card, use the two things that are
actually read:

```html
<title>How to deadhead roses</title>
<meta name="description" content="A short, accurate, human-written summary of the page.">
```

For machine-readable topical metadata, use structured data, which search engines document
and consume:

```html
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Article", "about": "Gardening" }
</script>
```

## Detectability

Fully detectable. The match is a single attribute value with no context that changes the
verdict.

The selector uses `=` rather than `~=`, which is the opposite of `link/shortcut-icon` and
`link/image-src` and is deliberate: `rel` is a space-separated set of tokens, so a
substring of it has to be matched as a token, but the `name` attribute of `<meta>` is a
single value. `keywords` there is the whole attribute or it is a different metadata name.
The `i` flag covers `Keywords` and `KEYWORDS`, which the HTML Standard treats as the same
name.

The fix removes the element. No browser acts on it, so deletion cannot change how the
page renders or behaves. One caveat is on the record rather than hidden: Bing's 2014 post
allows that the tag may retain some use for contextual ad systems, and a handful of
site-internal search indexes read it. Neither is default behaviour anywhere — both are
bespoke per-site integrations — and `--fix` is opt-in, so the op stands.

## Resources

- [HTML Standard — standard metadata names](https://html.spec.whatwg.org/multipage/semantics.html#meta-keywords) — defines the field, and carries the note quoted above about search engines not considering it.
- [Google Search Central — "Google does not use the keywords meta tag in web ranking" (September 2009)](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag) — the primary vendor statement, still published under Google's current documentation domain.
- [Bing Webmaster Blog — Duane Forrester, "Blame The Meta Keyword Tag" (4 October 2014)](https://blogs.bing.com/webmaster/October-2014/Blame-The-Meta-Keyword-Tag) — the second engine, in its own words, including the contextual-ad caveat noted above.
- [Search Engine Land — "The Meta Keywords Tag Lives At Bing & Why Only Spammers Should Use It" (2011)](https://searchengineland.com/the-meta-keywords-tag-lives-at-bing-why-only-spammers-should-use-it-96874) — documents the exchange in which Bing clarified the tag as a spam-detection signal rather than a ranking one.
