---
ruleId: "link/anchor-keywords"
title: "<link rel> anchor keywords"
description: "bookmark, external, nofollow, noopener, noreferrer, opener, tag, sponsored and ugc belong on <a>; on <link> they create nothing."
pubDate: "2026-09-23"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="bookmark" i], link[rel~="external" i], link[rel~="nofollow" i], link[rel~="noopener" i], link[rel~="noreferrer" i], link[rel~="opener" i], link[rel~="tag" i], link[rel~="sponsored" i], link[rel~="ugc" i]'
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the keyword from <link>. For a crawler hint, put it on the <a> it describes, or use <meta name=\"robots\" content=\"nofollow\"> for the whole page."
tags: ["hyperlinks", "search"]
impacts: ["seo", "maintainability"]
related: ["link/navigation-keywords", "link/vendor-keywords", "link/document-info-keywords"]
---

Some `rel` keywords describe a hyperlink the reader follows: `nofollow` tells a crawler
not to vouch for it, `noopener` cuts the new tab's handle on the opener, `tag` names a
category. They work on `<a>`. On `<link>` they describe no hyperlink, and the HTML
Standard forbids them there.

## Why avoid

The HTML Standard's link-types table has a column for `<link>`, and seven keywords read
"not allowed" in it: `bookmark`, `external`, `nofollow`, `noopener`, `noreferrer`,
`opener` and `tag`. The legend is normative: "The keyword must not be specified on link
elements." The `<link>` element section gives the result: "If the rel attribute is
absent, has no keywords, or if none of the keywords used are allowed according to the
definitions in this specification, then the element does not create any links."

The annotation keywords annotate hyperlinks that `<a>`, `<area>` and `<form>` create.
`bookmark` and `tag` create hyperlinks on `<a>` and `<area>` and nowhere else. Google
draws the same line for its own keywords: `sponsored`, `ugc` and `nofollow` "are used
only in <a> elements that Google can crawl, except nofollow, which is also available as
robots meta tag."

So a `<link rel="nofollow">` asks nothing of any crawler. In
`<link rel="stylesheet noreferrer">`, `noreferrer` annotates hyperlinks and the element
creates none: its one link is an external resource, fetched as if the keyword were
absent.

## Use instead

Put crawler hints on the anchor they describe, or state them for the whole page:

```html
<a href="https://example.com/offer" rel="sponsored">Offer</a>
<meta name="robots" content="nofollow">
```

On `<link>`, delete the keyword. `rel="alternate nofollow"` becomes `rel="alternate"`.

## Detectability

Detectable with the selector alone. One branch per keyword, with `~=` because `rel` is a
token set and `i` because keywords are ASCII case-insensitive. The CLI and the ESLint
plugin report and fix; the bookmarklet reports without a fix, having no source text.

The fix strips the matched keywords and keeps the rest as written, so
`rel="alternate nofollow"` keeps its live `alternate`. A `<link>` left with no keyword
goes, since it created no link to begin with. Nothing changes for a browser or a crawler.

Two forms stay out. Google also accepts comma-separated values such as
`rel="ugc,nofollow"`; `rel` splits on whitespace, so that is one token, and `~=` does
not match it. The XFN values stay out as well: the XFN 1.1 profile restricts no element,
and `rel="me"` on `<link>` is live identity markup.

## Resources

- [HTML Standard §4.6.8: Link types](https://html.spec.whatwg.org/multipage/links.html#linkTypes): the table marks the seven keywords "not allowed" in the `link` column, and the legend reads "The keyword must not be specified on link elements".
- [HTML Standard §4.2.4: The link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): when none of the keywords are allowed, "the element does not create any links".
- [Google Search Central: Qualify your outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links): `sponsored`, `ugc` and `nofollow` "are used only in <a> elements that Google can crawl".
