---
ruleId: "link/obsolete-rel"
title: "link rel with a dropped value"
description: "Fifteen dropped or non-conforming relation values; no browser acts on any of them."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="fluid-icon" i], link[rel~="archives" i], link[rel~="index" i], link[rel~="start" i], link[rel~="self" i], link[rel~="first" i], link[rel~="previous" i], link[rel~="last" i], link[rel~="edituri" i], link[rel~="logo" i], link[rel~="p3pv1" i], link[rel~="publisher" i], link[rel~="original-source" i], link[rel~="profile" i], link[rel~="chrome-webstore-item" i]'
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the keyword, and the tag once nothing live is left. Write previous as prev: <link rel=\"prev\" href=\"/page/1\">, though Google no longer reads the pair."
impacts: ["maintainability"]
related: ["link/rel-subresource"]
---

A `link` relation outside the living table creates no link. Fourteen of the fifteen values here fall outside it; the fifteenth, `previous`, is a forbidden synonym of `prev` inside it. Living types and registered extensions stay quiet.

## Why avoid

The living table defines twenty-seven link types. Fourteen of the fifteen values appear nowhere in it, so none of them creates a link.

`previous` is the exception. The Standard names it only to forbid it: user agents treat it like `prev`, and authors must not write it. Write `prev`. Google stopped using `prev` and `next` for indexing; its page says other search engines may still read them.

The Standard builds links per keyword as defined. An undefined keyword builds nothing: the element fetches nothing and navigates nowhere.

The extensions registry tells the backstory. `publisher` sits dropped, `first`/`index`/`last` went out under the W3C decision, and vendor fossils like `chrome-webstore-item` never left proposal land.

Dead relations cost bytes and review time, and sequence fossils cost direction too. Crawlers following `first`/`last` chains walk hints no engine honors.

## Use instead

Delete the dead keyword; the fixer does, and removes the tag once no live keyword is left. The fixer deletes `previous` too. It cannot write `prev` for you, so add `<link rel="prev">` by hand where the sequence matters. Where the intent was sequence navigation, the living pair covers it:

```html
<link rel="prev" href="/page/1">
<link rel="next" href="/page/3">
```

## Detectability

Detectable with the selector alone. Each branch pins one dropped token with `~=`, and the `i` flag folds case. Anything unlisted stays quiet by construction.

## Resources

- [WHATWG HTML: links](https://html.spec.whatwg.org/multipage/links.html): the living link-types table plus the per-keyword link creation rule.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the dropped table, the dropped-without-prejudice W3C decision quote, and the living extension registry.
- [WHATWG HTML: link types, synonyms](https://html.spec.whatwg.org/multipage/links.html#linkTypes): "user agents must also treat the keyword "previous" like the prev keyword"; synonyms "must not be used in documents".
- [Google Search Central: pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading): Google "no longer uses" rel=next and rel=prev, though "these links may still be used by other search engines".
