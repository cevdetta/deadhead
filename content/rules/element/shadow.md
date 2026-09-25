---
ruleId: "element/shadow"
title: "<shadow>"
description: "`shadow` is the dead Shadow DOM v0 slot for nested trees. Chrome removed v0. Use one v1 shadow root with `slot`."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "browser-convention"
detectability: "yes"
kind: "element"
scope: "any"
selector: 'shadow'
fix: { op: "none" }
replacement: "Attach a single v1 shadow root per host and compose it with `slot` elements and `slot` attributes. There is no nesting of shadow trees to port."
tags: ["web-components"]
impacts: ["interop", "maintainability"]
related: ["element/content"]
---

`<shadow>` composes nothing. `shadow` was the insertion point of Shadow DOM v0 for
nested shadow
trees: the placeholder inside a newer shadow root where an older shadow
root rendered. It belonged to the pre-standard era of Web Components, when
Chrome shipped v0 behind its own implementation while multiple shadow
roots per host were still on the table.

It was never standardized in HTML, and the v1 standard dropped the idea
entirely: one host carries one shadow root, composed with `slot`. Chrome
deprecated v0 with removal expected in Chrome 73 and then removed it;
MDN's `<shadow>` element page is gone, with the elements index filing it
as obsolete and pointing at `<slot>` instead.

## Why avoid

It was never a standard and it has no successor. `shadow` belonged to the
pre-standard Shadow DOM v0 era as the insertion point for older shadow
roots; the v1 model attaches one shadow root per host and composes it with
`slot`s. The DOM Standard's shadow-tree model knows only slots and
slottables.

The last engine removed it years ago. Chrome deprecated Shadow DOM v0 with
removal expected in Chrome 73, noting it was "not implemented in other
browsers"; the blink-dev removal thread then retired v0, Custom Elements
v0 and HTML Imports together.

The documentation is gone. MDN's `<shadow>` element page now returns 404,
and MDN's elements index files `<shadow>` under obsolete elements,
pointing at `<slot>` instead.

A leftover is silently dead. In any current engine `shadow` parses as an
unknown element, so the nested-tree composition it promises never happens
while looking like live component plumbing to the next reader.

## Use instead

Compose one v1 shadow tree with `slot` insertion points, assigning
light-DOM nodes via the `slot` attribute:

```html
<template id="badge-template">
  <span class="badge"><slot name="label">New</slot></span>
</template>
<my-badge><span slot="label">Sale</span></my-badge>
```

## Detectability

Fully detectable. The rule matches the bare element name `shadow`, with no
logic module: every instance is the obsolete insertion point. No other
HTML or SVG element shares the name, so the selector cannot false-positive.

There is no autofix. `shadow` can carry fallback content for the nested
tree, so removing the element would delete rendered fallback; rebuilding
the composition as v1 `slot`s is a manual edit.

## Resources

- [DOM Standard: Slots](https://dom.spec.whatwg.org/#shadow-tree-slots): the standard shadow-tree model defines slots and slottables; there is no `shadow` insertion point and one host carries one shadow root.
- [Chrome for Developers: Deprecations and Removals in Chrome 70](https://developer.chrome.com/blog/chrome-70-deps-rems): Shadow DOM v0 deprecated with removal expected in Chrome 73, as an experimental version not implemented in other browsers.
- [MDN: `<slot>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/slot): Baseline, widely available since January 2020; the specified composition mechanism, linking both the HTML and DOM definitions.
- [blink-dev: Intent to Deprecate and Remove: Shadow DOM V0, Custom Elements V0, HTML Imports](https://groups.google.com/a/chromium.org/g/blink-dev/c/h-JwMiPUnuU/m/8yiBD1SWAwAJ): the removal rationale (no other engines adopted v0) and timeline (disable, then remove the code).
