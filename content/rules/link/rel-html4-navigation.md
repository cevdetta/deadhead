---
ruleId: "link/rel-html4-navigation"
title: "link rel with an HTML 4 navigation type"
description: "contents, toc, glossary, chapter, section, subsection and appendix are HTML 4 link types the living standard dropped; they create no link."
pubDate: "2026-09-23"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="contents" i], link[rel~="toc" i], link[rel~="glossary" i], link[rel~="chapter" i], link[rel~="section" i], link[rel~="subsection" i], link[rel~="appendix" i]'
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the keyword; a link left with no keyword goes. Link the contents, glossary and chapters from visible navigation, and keep rel=\"next\" and rel=\"prev\" for sequences."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["link/obsolete-rel", "link/rel-dropped-hierarchy", "link/rel-anchor-only"]
---

HTML 4 let a document describe its place in a book: `<link rel="contents">` for the
table of contents, `rel="chapter"` for the chapters, `rel="glossary"` and
`rel="appendix"` for the back matter. The living HTML Standard kept `next` and `prev` and
dropped the book structure.

## Why avoid

HTML 4.01 §6.12 listed the navigation types among its "recognized link types":
`Contents` "refers to a document serving as a table of contents", `Chapter` to "a chapter
in a collection of documents", with `Glossary`, `Section`, `Subsection` and `Appendix`
alongside. The living HTML Standard's link-types table carries none of them. `next`,
`prev`, `help`, `license` and `search` survived.

The registry does not take them back. HTML Standard §4.6.8.27 points extensions to the
microformats existing-rel-values page, and conformance checkers must reject values "not
listed in either this specification or on the aforementioned page". The seven appear on
that page in the "formats" table, which records values other specs define, and not in
the "HTML5 link type extensions" registry. `toc` has no spec of its own: the page lists it
as a "Synonym of contents".

The `<link>` element section gives the outcome: when "none of the keywords used are
allowed according to the definitions in this specification, then the element does not
create any links." A `<link rel="contents">` is a tag no browser reads.

## Use instead

Link the book structure where readers see it, and keep the sequence types that survived:

```html
<nav aria-label="Book">
  <a href="/contents">Contents</a>
  <a href="/glossary">Glossary</a>
</nav>
<link rel="next" href="/chapter-3">
```

## Detectability

Detectable with the selector alone. One branch per keyword, with `~=` because `rel` is a
token set and `i` because keywords are ASCII case-insensitive. The CLI and the ESLint
plugin report and fix; the bookmarklet reports without a fix, having no source text.

The fix strips the matched keywords and keeps the rest as written, so
`rel="alternate section"` keeps its live `alternate`. A `<link>` left with no keyword
goes, since it created no link to begin with.

The other HTML 4 navigation types, `index`, `start`, `first` and `last`, belong to
`link/obsolete-rel`.

## Resources

- [HTML 4.01 §6.12: Link types](https://www.w3.org/TR/html401/types.html#type-links): W3C Recommendation, 1999-12-24; defines `Contents`, `Glossary`, `Chapter`, `Section`, `Subsection` and `Appendix` as recognized link types.
- [HTML Standard §4.6.8: Link types](https://html.spec.whatwg.org/multipage/links.html#linkTypes): the living table, which lists none of the seven.
- [HTML Standard §4.6.8.27: Other link types](https://html.spec.whatwg.org/multipage/links.html#other-link-types): values "not listed in either this specification or on the aforementioned page must be rejected as invalid".
- [HTML Standard §4.2.4: The link element](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element): a `<link>` with no allowed keyword "does not create any links".
- [microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the "formats" table records the seven as HTML 4 link types, with `toc` as a synonym of `contents`.
