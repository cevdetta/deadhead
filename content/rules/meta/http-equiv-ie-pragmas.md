---
ruleId: "meta/http-equiv-ie-pragmas"
title: "meta http-equiv with IE-only values"
description: "imagetoolbar, msthemecompatible, and the Page/Site-Enter/Exit transitions only ever worked in Internet Explorer; delete the tags."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv]'
match: "logic"
fix: { op: "remove-element" }
replacement: "Delete the tag. Image toolbars, XP theming hooks, and DX-filter page transitions have no modern equivalent."
tags: ["http-equiv", "microsoft"]
impacts: ["maintainability"]
related: ["meta/msapplication-names"]
---

A cluster of http-equiv values only ever worked in Internet Explorer. `imagetoolbar`
silenced the IE 6 image toolbar and `msthemecompatible` took Windows XP visual
styles. A transitions family played PowerPoint-style wipes between page loads.

## Why avoid

The audience is retired. IE 11 ended support on 15 June 2022 and its
desktop application was later permanently disabled; every other browser
has always ignored these values. The transitions family was already
deprecated as of IE9 in Microsoft's own documentation. What remains is
fairly prevalent dead weight: `imagetoolbar` alone survives on over a
hundred thousand sites, maintained for a browser that no longer runs.

## Use instead

Delete the tag. There is no replacement because there is nothing left to
switch: no other engine has an image toolbar, XP theming hooks, or
DX-filter transitions.

## Detectability

The rule pre-filters with `meta[http-equiv]`: the verdict depends
on whether the trimmed value, compared ASCII case-insensitively, is one of
the six IE-only keywords. The decision therefore lives in
`packages/rules/logic/meta/http-equiv-ie-pragmas.ts`. Deliberately excluded:
`cleartype`: no primary Microsoft source for an http-equiv switch
surfaced, so it stays unclaimed rather than guessed. The fix removes the
element: no surviving browser acts on any claimed value.

## Resources

- [Microsoft Learn: Introduction to Filters and Transitions (archived IE docs)](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/ms532847(v=vs.85)): Page-Enter/Page-Exit/Site-Enter/Site-Exit interpage transitions via meta tags; deprecated as of IE9.
- [Microsoft Learn: IE11 end of support](https://learn.microsoft.com/en-us/lifecycle/announcements/internet-explorer-11-end-of-support): IE 11 ended support June 15, 2022.
- [HTML Standard: Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives): none of these values is a pragma keyword, so all map to no state.
