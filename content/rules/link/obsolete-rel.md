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
match: "logic"
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Keep self and edituri where WebSub or WordPress's XML-RPC discovery still applies, and delete the other dead keywords. Write previous as prev: <link rel=\"prev\" href=\"/page/1\">, though Google no longer reads the pair."
impacts: ["maintainability"]
related: ["link/subresource"]
---

A `link` relation outside the living table creates no HTML link, but two of the fifteen values here still feed a non-browser reader: WebSub subscribers parse `self`, and WordPress's own apps parse `edituri`. The other thirteen have no such reader. Living types and registered extensions stay quiet.

## Why avoid

The living table defines twenty-seven link types. Fourteen of the fifteen values appear nowhere in it, so none of them creates an HTML link.

Two keywords still work outside the browser. WebSub, a W3C Recommendation, makes `<link rel="self">` the HTML fallback for a topic's canonical URL: a subscriber's `hub.topic` request must use "the 'self' URL found during the discovery step," and shipping WebSub clients such as p3k-websub parse it straight out of the HTML. WordPress prints `<link rel="EditURI" type="application/rsd+xml">` on every page by default, and the official WordPress iOS and Android apps regex-match that exact tag to find a self-hosted site's XML-RPC endpoint when the default path fails. Deleting either token breaks that reader, even though no browser creates a link from it.

`previous` is the exception among the rest. The Standard names it only to forbid it: user agents treat it like `prev`, and authors must not write it. Write `prev`. Google stopped using `prev` and `next` for indexing; its page says other search engines may still read them.

The Standard builds links per keyword as defined. An undefined keyword builds nothing: the element fetches nothing and navigates nowhere.

The extensions registry tells the backstory. `publisher` sits dropped, `first`/`index`/`last` went out under the W3C decision, and vendor fossils like `chrome-webstore-item` never left proposal land.

Dead relations cost bytes and review time, and sequence fossils cost direction too. Crawlers following `first`/`last` chains walk hints no engine honors.

## Use instead

On a link with none of `self`, `edituri` or `previous`, the fixer deletes the dead keywords, and the tag once no live keyword is left. Edit a link holding any of those three by hand. Rewrite `previous` as `prev` where the sequence matters; the fixer cannot write `prev` for you. Keep `self` if the page publishes to WebSub, and `hub` alongside it. Keep `edituri` if the site still serves the XML-RPC endpoint WordPress apps discover through it; once XML-RPC is off, the `EditURI` link points at a dead endpoint and can go. Where the intent was sequence navigation, the living pair covers it:

```html
<link rel="prev" href="/page/1">
<link rel="next" href="/page/3">
```

## Detectability

Detectable with the selector alone. Each branch pins one dropped token with `~=`, and the `i` flag folds case. Anything unlisted stays quiet by construction. A logic module decides only whether the autofix runs.

The autofix deletes every listed keyword, and the tag once no live keyword is left, on a link whose `rel` holds none of `self`, `edituri` or `previous`. A link holding any of them carries no fix, because the fixer deletes every keyword the selector tests: deleting `self` breaks WebSub topic-URL discovery for a subscriber that relies on it, deleting `edituri` breaks the WordPress apps' XML-RPC endpoint discovery, and deleting `previous` drops a link that user agents treat as `prev` and that Google says other search engines may still read. A person has to check whether a consumer applies, and rewrite `previous` as `prev`, before removing a token.

## Resources

- [WHATWG HTML: links](https://html.spec.whatwg.org/multipage/links.html): the living link-types table plus the per-keyword link creation rule.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the dropped table, the dropped-without-prejudice W3C decision quote, and the living extension registry.
- [WHATWG HTML: link types, synonyms](https://html.spec.whatwg.org/multipage/links.html#linkTypes): "user agents must also treat the keyword "previous" like the prev keyword"; synonyms "must not be used in documents".
- [Google Search Central: pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading): Google "no longer uses" rel=next and rel=prev, though "these links may still be used by other search engines".
- [W3C: WebSub](https://www.w3.org/TR/websub/): `rel="self"`/`rel="hub"` as the HTML discovery fallback; a subscriber's `hub.topic` request must use "the 'self' URL found during the discovery step".
- [WordPress Developer Reference: `rsd_link()`](https://developer.wordpress.org/reference/functions/rsd_link/): WordPress core prints the `EditURI` link on every page by default.
- [WordPress for iOS: `WordPressOrgXMLRPCValidator.swift`](https://github.com/wordpress-mobile/WordPress-iOS/blob/trunk/Modules/Sources/WordPressKit/WordPressOrgXMLRPCValidator.swift): `extractRSDURLFromHTML` pulls the RSD link out of the page when the default XML-RPC path fails.
- [WordPress for Android: `SelfHostedEndpointFinder.java`](https://github.com/wordpress-mobile/WordPress-Android/blob/trunk/libs/fluxc/src/main/java/org/wordpress/android/fluxc/network/discovery/SelfHostedEndpointFinder.java): `RSD_LINK` regex-matches `<link rel="EditURI" type="application/rsd+xml" title="RSD">` during endpoint discovery.
