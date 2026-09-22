---
ruleId: "link/obsolete-rel"
title: "link rel with a dropped value"
description: "Fifteen dropped relation values no engine honors; the living table names none of them."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="fluid-icon" i], link[rel~="archives" i], link[rel~="index" i], link[rel~="start" i], link[rel~="self" i], link[rel~="first" i], link[rel~="previous" i], link[rel~="last" i], link[rel~="edituri" i], link[rel~="logo" i], link[rel~="p3pv1" i], link[rel~="publisher" i], link[rel~="original-source" i], link[rel~="profile" i], link[rel~="chrome-webstore-item" i]'
fix: { op: "remove-element" }
replacement: "Delete the tag. For document sequences, the living keywords are prev and next: <link rel=\"prev\" href=\"/page/1\">."
tags: ["head", "link"]
impacts: ["maintainability"]
related: ["link/rel-subresource"]
---

A `link` relation outside the living table creates no link. Fifteen such dropped values trip this rule; living types and registered extensions stay quiet.

## Why avoid

The living table defines twenty-seven link types. All fifteen values were checked against the fetched section with zero hits, so none creates a link.

The Standard builds links per keyword as defined. An undefined keyword builds nothing: the element fetches nothing and navigates nowhere.

The extensions registry tells the backstory. `publisher` sits dropped, `first`/`index`/`last` went out under the W3C decision, and vendor fossils like `chrome-webstore-item` never left proposal land.

Dead relations cost bytes and review time, and sequence fossils cost direction too. Crawlers following `first`/`previous`/`last` chains walk hints no engine honors.

## Use instead

Delete the tag. Where the intent was sequence navigation, the living pair covers it:

```html
<link rel="prev" href="/page/1">
<link rel="next" href="/page/3">
```

## Detectability

Detectable with the selector alone. Each branch pins one dropped token with `~=`, and the `i` flag folds case. Anything unlisted stays quiet by construction.

## Resources

- [WHATWG HTML: links](https://html.spec.whatwg.org/multipage/links.html): the living link-types table plus the per-keyword link creation rule.
- [Microformats: existing rel values](https://microformats.org/wiki/existing-rel-values): the dropped table, the dropped-without-prejudice W3C decision quote, and the living extension registry.
