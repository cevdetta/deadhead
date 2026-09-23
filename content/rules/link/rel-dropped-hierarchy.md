---
ruleId: "link/rel-dropped-hierarchy"
title: "link rel with a dropped hierarchy token"
description: "Twenty-two dropped hierarchy tokens no engine honors as link types."
pubDate: "2026-09-22"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="banner" i], link[rel~="begin" i], link[rel~="end" i], link[rel~="top" i], link[rel~="origin" i], link[rel~="biblioentry" i], link[rel~="bibliography" i], link[rel~="citation" i], link[rel~="collection" i], link[rel~="definition" i], link[rel~="disclaimer" i], link[rel~="editor" i], link[rel~="footnote" i], link[rel~="navigate" i], link[rel~="pointer" i], link[rel~="trademark" i], link[rel~="translation" i], link[rel~="urc" i], link[rel~="up" i], link[rel~="child" i], link[rel~="parent" i], link[rel~="sibling" i]'
fix: { op: "remove-tokens", attr: "rel" }
replacement: "Delete the tag, or only the keyword when rel also holds live ones. Where sequence navigation was the intent, link the living pair instead: <link rel=\"prev\" href=\"/page/1\">."
impacts: ["maintainability"]
related: ["link/obsolete-rel", "link/rel-dead-vendor"]
---

Twenty-two `link` tokens map document hierarchies no engine renders. The set spans sequence markers and hierarchy markers, bibliography hooks and legal hooks, plus pointer and translation relics. The living link table defines none of them, so the element fetches nothing and navigates nowhere.

## Why avoid

A `rel` keyword outside the living table creates no link. The HTML Standard builds links per defined keyword and discards the rest. Its table holds 27 types, from `alternate` to `prev`, and names none of the twenty-two.

The tokens entered through drafts that never became law. HTML3 reserved toolbar slots for `Up` and `Banner`. The proposed HTML4.0 relationship list defined hierarchy rows, sequence rows, bibliography rows, and legal rows. HTML4.01 section 6.12 kept none of them. The W3C Issue-118 decision then dropped `index`, `up`, `first`, and `last` for lack of interest from implementors and users, naming `begin` and `start`, `top` and `contents`, `toc` and `end` as the related set.

Three tokens need a scope note. `child`, `parent`, and `sibling` survive as person relations on anchors in the XFN vocabulary. This rule matches `link` elements alone, where the document-hierarchy sense died with the drafts. Anchor usage stays outside this rule.

The residue costs bytes and review time. A `begin`/`end` chain suggests an order that no engine follows, and a `top` pointer names a root that no toolbar renders.

## Use instead

Delete the tag. Where sequence navigation was the intent, the living pair covers it:

```html
<link rel="prev" href="/page/1">
<link rel="next" href="/page/3">
```

## Detectability

Detectable with the selector alone. Each branch pins one dropped token with `~=`, and the `i` flag folds case. Anything unlisted stays quiet by construction.

The fix removes the element. Removal takes nothing working with it: no defined link type sits behind any token, so each element does nothing.

## Resources

- [WHATWG HTML: links](https://html.spec.whatwg.org/multipage/links.html): the living link-types table and the per-keyword link creation rule; fetched 2026-09-22.
- [HTML4.01: link types](https://www.w3.org/TR/html401/types.html): section 6.12 recognized list, from Alternate through Bookmark, omits all twenty-two.
- [W3C: proposed HTML4.0 relationship values](https://www.w3.org/TR/relations.html): status-free draft naming the hierarchy, sequence, bibliography, and legal rows as REL values.
- [HTML3: head element and related elements](https://www.w3.org/MarkUp/html3/dochead.html): toolbar LINK values Up and Banner with example markup.
- [W3C Issue-118 decision](http://lists.w3.org/Archives/Public/public-html/2011Feb/att-0481/issue-118-decision.html): adopts removal of index, up, first, and last for lack of interest from implementors and users.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the dropped table and the dropped-without-prejudice decision quote.
