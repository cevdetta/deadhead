---
ruleId: "attr/global-contextmenu"
title: "global contextmenu and onshow"
description: "contextmenu and onshow are obsolete; script event handling replaces them, so delete the attributes."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "[contextmenu], [onshow]"
fix: { op: "remove-attribute", attr: "contextmenu" }
replacement: "Delete the attributes. Handle the contextmenu event in script: target.addEventListener(\"contextmenu\", show)."
tags: ["scripting"]
impacts: ["maintainability"]
related: ["attr/menu-obsolete"]
---

`contextmenu` and `onshow` name menus nothing builds. WHATWG lists both as obsolete on all elements with one replacement, script handling of the `contextmenu` event, after the declarative menu feature left the specification for lack of implementer interest.

## Why avoid

WHATWG lists both as obsolete with one replacement. Section 16.2 names `contextmenu` on all elements and `onshow` on all elements as obsolete: to implement a custom context menu, use script to handle the `contextmenu` event. The declarative menu feature left the specification for lack of implementer interest, so the attributes name menus nothing builds.

Engines deleted the feature outright. Mozilla removed the menu context plumbing with the `type` and `label` attributes in one bug, and the compatibility entry for the global `contextmenu` attribute left the data set once the last browser dropped it. The `show` event that once fired for these menus has no engine behind it either.

MDN documents the live mechanism. Its `contextmenu` event page fires on right-click through `addEventListener` or the `oncontextmenu` property, with `preventDefault` canceling the browser menu. Script owns the whole interaction; markup declares nothing.

## Use instead

Handle the event in script and drop both attributes:

```js
target.addEventListener("contextmenu", (event) => showMenu(event));
```

## Detectability

Complete detection. The rule matches `[contextmenu]` or `[onshow]`: presence of either attribute is the whole verdict, so no logic module exists. Neither alternative leads with a tag, so the rule dispatches from the wildcard bucket like any document-wide check. Autofix drops `contextmenu`; a lone `onshow` or the remainder of a pair needs a hand edit, since one rule carries one fix attribute.

## Resources

- [WHATWG: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html): `contextmenu` and `onshow` on all elements are obsolete: script `contextmenu` handling.
- [MDN: `contextmenu` event](https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event): the event fires on right-click for `addEventListener` or `oncontextmenu` handling.
- [Mozilla bug 1372276](https://bugzilla.mozilla.org/show_bug.cgi?id=1372276): removed the menu context plumbing with the `type` and `label` attributes.
