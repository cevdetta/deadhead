---
ruleId: "attr/area-hreflang-type-nohref"
title: "<area hreflang, type, nohref>"
description: "hreflang, type and nohref do nothing on area; omit them, dropping href where no link is meant."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "area[hreflang], area[type], area[nohref]"
fix: { op: "remove-attributes" }
replacement: "Delete the attributes. Omit href where the region links nowhere: <area shape=\"rect\" coords=\"0,0,10,10\">."
tags: ["hyperlinks", "media"]
impacts: ["maintainability"]
related: ["attr/a-coords-shape"]
---

`hreflang`, `type` and `nohref` do nothing on `area`. WHATWG buries all three with the same instruction, omit them altogether, since no region processing reads them and no IDL member backs them.

## Why avoid

WHATWG buries all three with the same instruction. Section 16.2 says `hreflang` and `type` on `area` do not do anything useful, and for historical reasons have no corresponding IDL attributes: omit them altogether. It says `nohref` on `area` is unnecessary since omitting `href` is sufficient: omit it altogether. The current `HTMLAreaElement` carries no member for any of the three, which makes the claim checkable: there is no code path that could read them.

The W3C reference agrees on `nohref` in so many words: the attribute is obsolete and omitting `href` is sufficient. MDN's `area` page documents the live attributes around the gap: `alt`, `coords`, `download`, `href`, `ping`, `referrerpolicy`, `rel`, `shape`, `target`. None of the three appears. A dead region marker still maps; the author-facing text is all that changes.

## Use instead

A linked region without the spare attributes:

```html
<map name="shapes">
  <area shape="rect" coords="25,25,125,125" href="red.html" alt="Red box">
</map>
```

A dead region with no link at all:

```html
<map name="holes">
  <area shape="rect" coords="50,50,100,100">
</map>
```

## Detectability

Complete detection. The rule matches `area[hreflang]`, `area[type]` or `area[nohref]`: presence of any of the three is the whole verdict, so no logic module exists. The autofix removes every attribute the rule names that is present on the element, and leaves every other attribute as written.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): the three attributes do nothing useful with no IDL behind them, and omitting `href` beats `nohref`.
- [W3C: `area` reference](http://w3c.github.io/html-reference/area.html): `nohref` is obsolete and omitting `href` is sufficient.
- [MDN: `<area>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/area): documents the live attributes with none of the three among them.
