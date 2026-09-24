---
ruleId: "link/navigation-keywords"
title: "<link rel> navigation keywords"
description: "Navigation link types from HTML 4 and early drafts: the living standard defines none of them, so they create no link."
pubDate: "2026-09-24"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="first" i], link[rel~="last" i], link[rel~="previous" i], link[rel~="start" i], link[rel~="begin" i], link[rel~="end" i], link[rel~="top" i], link[rel~="up" i], link[rel~="parent" i], link[rel~="child" i], link[rel~="sibling" i], link[rel~="index" i], link[rel~="contents" i], link[rel~="toc" i], link[rel~="glossary" i], link[rel~="chapter" i], link[rel~="section" i], link[rel~="subsection" i], link[rel~="appendix" i], link[rel~="archives" i], link[rel~="navigate" i], link[rel~="origin" i]'
match: "logic"
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the keyword; a link left with no keyword goes. Rewrite previous as prev, link the contents and chapters from visible navigation, and keep rel=\"next\" and rel=\"prev\" for sequences."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["link/document-info-keywords", "link/vendor-keywords", "link/copyright", "link/anchor-keywords"]
---

HTML 4 and the drafts around it let a page describe its place in a series or a book:
`first`, `previous` and `last` for a sequence, `up`, `parent`, `child` and `sibling` for
a hierarchy, `contents`, `chapter` and `appendix` for a book. The living HTML Standard
kept `next` and `prev` and dropped the rest, so none of these twenty-two keywords creates
a link.

## Why avoid

A `rel` keyword outside the living table creates no link. The `<link>` element section
gives the outcome: when "none of the keywords used are allowed according to the
definitions in this specification, then the element does not create any links." The
table holds 27 types, from `alternate` to `prev`, and names none of the twenty-two.

HTML 4.01 §6.12 listed eight of them among its "recognized link types": `Start`,
`Contents`, `Index`, `Glossary`, `Chapter`, `Section`, `Subsection` and `Appendix`.
`Contents` "refers to a document serving as a table of contents", `Chapter` to "a chapter
in a collection of documents". `toc` has no spec of its own: the microformats page lists
it as a "Synonym of contents".

The book types stay out of the registry too. HTML Standard §4.6.8.27 points extensions to
the microformats existing-rel-values page, and conformance checkers must reject values
"not listed in either this specification or on the aforementioned page". `contents`,
`toc`, `glossary`, `chapter`, `section`, `subsection` and `appendix` appear on that page
in the "formats" table, which records values other specs define, and not in the "HTML5
link type extensions" registry.

The hierarchy and sequence tokens `begin`, `end`, `top`, `up`, `parent`, `child`,
`sibling`, `navigate` and `origin` entered through drafts that never became law. HTML3
reserved a toolbar slot for `Up`. The proposed HTML4.0 relationship list defined hierarchy
and sequence rows, and HTML 4.01 §6.12 kept none of them. The W3C Issue-118 decision then dropped `index`,
`up`, `first` and `last` for lack of interest from implementors and users, naming `begin`
and `start`, `top` and `contents`, `toc` and `end` as the related set. The microformats
page records `archives` under POSH usage alone, a list of what sites wrote.

`previous` is the exception. The Standard names it to forbid it: user agents treat it
like `prev`, and authors must not write it. Google stopped using `prev` and `next` for
indexing; its page says other search engines may still read them.

`child`, `parent` and `sibling` survive as person relations on anchors in the XFN
vocabulary. This rule matches `<link>` elements alone, where the document-hierarchy sense
died with the drafts.

The residue costs bytes and review time. A `begin`/`end` or `first`/`last` chain suggests
an order that no browser follows, and a `top` pointer names a root that no toolbar
renders.

## Use instead

Link the book structure where readers see it, write `previous` as `prev`, and keep the
sequence types that survived:

```html
<nav aria-label="Book">
  <a href="/contents">Contents</a>
  <a href="/glossary">Glossary</a>
</nav>
<link rel="prev" href="/chapter-1">
<link rel="next" href="/chapter-3">
```

## Detectability

Detectable with the selector alone. One branch per keyword, with `~=` because `rel` is a
token set and `i` because keywords are ASCII case-insensitive. Anything unlisted stays
quiet by construction. A logic module decides whether the autofix runs; the selector
alone decides the finding. The CLI and the ESLint plugin report and fix; the bookmarklet
reports without a fix, having no source text.

The fix strips the matched keywords and keeps the rest as written, so
`rel="alternate section"` keeps its live `alternate`. A `<link>` left with no keyword
goes, since it created no link to begin with.

A link whose `rel` holds `previous` carries no fix. The fixer deletes every keyword the
selector tests, and deleting `previous` drops a link that user agents treat as `prev` and
that Google says other search engines may still read. Rewrite it as `prev` by hand; the
fixer cannot write a keyword.

## Resources

- [HTML Standard §4.6.8: Link types](https://html.spec.whatwg.org/multipage/links.html#linkTypes): the living table, which lists none of the twenty-two; "user agents must also treat the keyword "previous" like the prev keyword", and synonyms "must not be used in documents".
- [HTML Standard §4.2.4: The link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): a `<link>` with no allowed keyword "does not create any links".
- [HTML Standard §4.6.8.27: Other link types](https://html.spec.whatwg.org/multipage/links.html#other-link-types): values "not listed in either this specification or on the aforementioned page must be rejected as invalid".
- [HTML 4.01 §6.12: Link types](https://www.w3.org/TR/html401/types.html#type-links): W3C Recommendation, 1999-12-24; defines `Start`, `Contents`, `Index`, `Glossary`, `Chapter`, `Section`, `Subsection` and `Appendix` as recognized link types, and none of the draft hierarchy tokens.
- [W3C: proposed HTML4.0 relationship values](https://www.w3.org/TR/relations.html): status-free draft naming the hierarchy and sequence rows as REL values.
- [HTML3: head element and related elements](https://www.w3.org/MarkUp/html3/dochead.html): toolbar LINK value Up with example markup.
- [W3C Issue-118 decision](http://lists.w3.org/Archives/Public/public-html/2011Feb/att-0481/issue-118-decision.html): adopts removal of index, up, first, and last for lack of interest from implementors and users.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the "formats" table records the book types as HTML 4 link types, with `toc` as a synonym of `contents`; the dropped tables and the POSH usage row for `archives`.
- [Google Search Central: pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading): Google "no longer uses" rel=next and rel=prev, though "these links may still be used by other search engines".
