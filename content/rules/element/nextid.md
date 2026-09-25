---
ruleId: "element/nextid"
title: "<nextid>"
description: "nextid is an unknown element; name targets with unique id attributes instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: 'nextid'
fix: { op: "none" }
replacement: "Identify elements with unique `id` attributes."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["element/isindex"]
---

`<nextid>` identifies nothing. `<nextid>` is a leftover from the web's first years: an
empty `head` element
whose `n` attribute handed the next document identifier to editors that
numbered anchors automatically. The HTML Standard lists it under
non-conforming features with the direction "Use GUIDs instead", and W3C's
HTML5 author guidance says the same.

## Why avoid

It is entirely obsolete and must not be used by authors, and no browser does
anything with it. The element maps to `HTMLUnknownElement`, and it is not
void: historically a `head` element, it is moved into `body` by
spec-compliant parsers while other parsers keep it in `head`. Its placement
disagrees between engines, so markup containing it does not even mean the
same tree everywhere.

Unique `id` attributes are the replacement on every engine. They identify
elements for fragment links, labels, and scripting: everything the automatic
numbering was for, without a dead tag.

## Use instead

A unique identifier on the element that needs one:

```html
<section id="a3f1c9e2-7b4d-4e8f-9c0a-2d5f6b7e8a9c0">
  <h2>Report</h2>
</section>
```

## Detectability

Fully detectable. The rule matches the bare element name `nextid`; no logic
module is needed. The scope is `any` deliberately: because parsers disagree
about whether the element lives in `head` or `body`, a head-scoped rule would
diverge between adapters, while `any` reports it once wherever it lands. All
three adapters agree on a closed
`<nextid></nextid>` as the last element of `head`, down to identical source
positions in the source-backed adapters.

There is no autofix. An unclosed `<nextid>` contains the content after it, so
removal is not reliably a pure deletion, and the fix op is `none`.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `nextid` is entirely obsolete; GUIDs instead.
- [W3C HTML5: Edition for Web Authors: Obsolete features](https://www.w3.org/TR/2011/WD-html5-author-20110809/obsolete.html): independent W3C list with the same verdict and replacement.
