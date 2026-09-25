---
ruleId: "link/document-info-keywords"
title: "<link rel> document-info keywords"
description: "Link types naming a document's logo, editor, notes or legal terms: HTML gives none of them a processing model, so browsers ignore them."
pubDate: "2026-09-24"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="self" i], link[rel~="logo" i], link[rel~="profile" i], link[rel~="banner" i], link[rel~="bibliography" i], link[rel~="biblioentry" i], link[rel~="citation" i], link[rel~="collection" i], link[rel~="definition" i], link[rel~="disclaimer" i], link[rel~="editor" i], link[rel~="footnote" i], link[rel~="pointer" i], link[rel~="trademark" i], link[rel~="translation" i], link[rel~="urc" i]'
match: "logic"
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the tag, or the keyword alone when rel also holds live ones. Keep self where the page publishes to WebSub. Link notes and legal terms from the page, and license terms with rel=\"license\"."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["link/navigation-keywords", "link/vendor-keywords", "link/copyright"]
---

Sixteen `link` tokens describe the document itself: `logo`, `banner` and `profile` for
its identity, `bibliography`, `citation`, `footnote` and `definition` for its apparatus,
`disclaimer` and `trademark` for its legal notes, plus `editor`, `translation`, `pointer`,
`urc` and `self`. The living link table defines none of them, and HTML gives none a
processing model a browser could implement. One of the sixteen, `self`, still feeds a
non-browser reader.

## Why avoid

None of the sixteen is in the living link table, which holds 27 types from `alternate`
to `prev`. Fifteen have no allowed entry in the microformats registry either, so a
`<link>` carrying them alone "does not create any links". `profile` sits in that registry
as a "proposed" extension. The `<link>` element section's "possible supported tokens",
the keywords a browser can implement, run from `alternate` to `stylesheet` and include
none of the sixteen.

Most of the tokens entered through drafts that never became law. HTML3 reserved a toolbar
slot for `Banner`. The proposed HTML4.0 relationship list defined bibliography rows and
legal rows, plus pointer and translation relics. HTML 4.01 §6.12 kept none of them, and
the microformats page files them in its dropped table.

`logo` and `profile` appear nowhere in the living table either.

`self` still works outside the browser. WebSub, a W3C Recommendation, makes
`<link rel="self">` the HTML fallback for a topic's canonical URL: a subscriber's
`hub.topic` request must use "the 'self' URL found during the discovery step," and the
p3k-websub client library reads `self` straight out of an HTML page's `<link>` elements.
Deleting the token breaks that reader, even though no browser creates a link from it.

The residue costs bytes and review time. A `translation` or `editor` link promises a
relation no browser exposes, and a `disclaimer` link hides legal text in a place no
reader sees.

## Use instead

Link notes, credits and legal terms where readers see them, and name license terms with
the living `license` type. Keep `self` if the page publishes to WebSub, and `hub`
alongside it.

```html
<link rel="license" href="/license">
<footer>
  <a href="/legal/disclaimer">Disclaimer</a>
  <a href="/legal/trademarks">Trademarks</a>
</footer>
```

## Detectability

Detectable with the selector alone. Each branch pins one token with `~=`, and the `i`
flag folds case. Anything unlisted stays quiet by construction. A logic module decides
whether the autofix runs; the selector alone decides the finding.

The autofix deletes every listed keyword, and the tag once no live keyword is left, on a
link whose `rel` does not hold `self`. A link holding `self` carries no fix: the fixer
deletes every keyword the selector tests, and deleting `self` breaks WebSub topic-URL
discovery for a subscriber that relies on it. A person has to check whether the page
publishes to WebSub before removing it.

For the other fifteen tokens the removal takes nothing working with it: HTML gives the
token no processing model, so the element does nothing in a browser.

## Resources

- [WHATWG HTML: links](https://html.spec.whatwg.org/multipage/links.html): the living link-types table and the per-keyword link creation rule.
- [HTML Standard §4.2.4: The link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): a `<link>` with no allowed keyword "does not create any links"; the "possible supported tokens" run from `alternate` to `stylesheet` and include none of the sixteen.
- [HTML4.01: link types](https://www.w3.org/TR/html401/types.html): section 6.12 recognized list, from Alternate through Bookmark, omits all sixteen.
- [W3C: proposed HTML4.0 relationship values](https://www.w3.org/TR/relations.html): status-free draft naming the bibliography and legal rows as REL values.
- [HTML3: head element and related elements](https://www.w3.org/MarkUp/html3/dochead.html): toolbar LINK value Banner with example markup.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the dropped table, the dropped-without-prejudice decision quote, and `profile` as a "proposed" extension.
- [W3C: WebSub](https://www.w3.org/TR/websub/): `rel="self"`/`rel="hub"` as the HTML discovery fallback; a subscriber's `hub.topic` request must use "the 'self' URL found during the discovery step".
- [p3k-websub: `Client.php`](https://github.com/aaronpk/p3k-websub/blob/master/src/p3k/WebSub/Client.php): `discover()` walks the page's `link[@href]` elements and records `rel="self"` as the topic's self URL.
