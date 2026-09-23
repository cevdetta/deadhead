---
ruleId: "meta/obsolete-name"
title: "meta name with a dead keyword"
description: "Thirty-two gist-era names that never standardized; verify-v1 may still hold a Search Console verification."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="subject" i], meta[name="copyright" i], meta[name="language" i], meta[name="revised" i], meta[name="topic" i], meta[name="summary" i], meta[name="classification" i], meta[name="designer" i], meta[name="reply-to" i], meta[name="owner" i], meta[name="url" i], meta[name="identifier-url" i], meta[name="directory" i], meta[name="pagename" i], meta[name="category" i], meta[name="subtitle" i], meta[name="target" i], meta[name="date" i], meta[name="search_date" i], meta[name="medium" i], meta[name="syndication-source" i], meta[name="original-source" i], meta[name="verify-v1" i], meta[name="y_key" i], meta[name="pagekey" i], meta[name="microid" i], meta[name="readability-verification" i], meta[name="icbm" i], meta[name="norton-safeweb" i], meta[name="tweetmeme-title" i], meta[name="blogcatalog" i], meta[name="apple-touch-fullscreen" i]'
match: "logic"
fix: { op: "remove-element" }
replacement: "For verify-v1, confirm Search Console verification through google-site-verification first; then delete the element. Describe the page with real content instead: <meta name=\"description\" content=\"A short, accurate, human-written summary of the page.\">."
tags: ["search"]
impacts: ["seo", "maintainability"]
related: ["meta/keywords"]
---

A `meta` name from the gist era that never standardized feeds no consumer, with one open question: `verify-v1` may still hold a Search Console verification for a site that never migrated to `google-site-verification`. Thirty-two such keywords trip this rule; live names, current verification tags such as `google-site-verification`, and `rating` stay quiet.

## Why avoid

The Standard defines a closed metadata-name set. All thirty-two names were checked against the fetched WHATWG text with zero `meta name` hits: none standardized.

The registry agrees case by case. `icbm` sits as Proposal, `blogcatalog` as Incomplete proposal, and `verify-v1` as superseded legacy.

The list mixes verification tokens, geo jokes, SEO hopefuls and dead vendor hooks. Each had a moment, and thirty-one no longer have a consumer. `verify-v1` is the one name whose consumer is unsettled: Google's last public word on it, from December 2012, says Search "currently" supports "ye olde format", and Search Console's help page says it drops a site's verification once its token disappears. No later statement says whether Search Console still recognizes the legacy `verify-v1` spelling.

Dead keywords cost bytes and review time, and the SEO-flavored ones cost hope too. Filling them feels like optimization while changing nothing.

## Use instead

Delete the element for the thirty-one dead names; nothing replaces them, because nothing was being done. For `verify-v1`, confirm in Search Console that the property is verified through the current `google-site-verification` token before deleting the legacy one; deleting it first can revoke a verification Search Console still checks. Describe the page for readers and crawlers with real content:

```html
<title>How to deadhead roses</title>
<meta name="description" content="A short, accurate, human-written summary of the page.">
```

## Detectability

Detectable with the selector alone. The comma lists every dead name with `=` (a single value, not a token set) and the `i` flag folds case. Anything unlisted stays quiet by construction. A logic module decides only whether the autofix runs.

The autofix deletes the element for the thirty-one dead names. `verify-v1` carries no fix: it may still hold a Search Console verification for a site that verified through it and never added `google-site-verification`, and deleting it without confirming the current token first can revoke that verification.

## Resources

- [WHATWG HTML: semantics](https://html.spec.whatwg.org/multipage/semantics.html): the closed metadata-name set; all thirty-two names checked against the fetched text with zero `meta name` hits.
- [WHATWG Wiki: MetaExtensions](https://wiki.whatwg.org/wiki/MetaExtensions): Proposal, Incomplete and Superseded verdicts on the sampled names.
- [Google Search Central: Webmaster Tools verification strategies (December 2012)](https://developers.google.com/search/blog/2012/12/webmaster-tools-verification-strategies): "currently supporting ye olde format" for the legacy verification tag, with no later statement withdrawing it.
- [Search Console Help: Verify your site ownership](https://support.google.com/webmasters/answer/9008080): verification "lasts as long as Search Console can confirm the presence and validity of your verification token".
