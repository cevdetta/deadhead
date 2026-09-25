---
ruleId: "element/content"
title: "<content>"
description: "`content` is the dead Shadow DOM v0 slot. The v1 standard uses `slot`, and Chrome removed v0. A leftover distributes nothing."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "browser-convention"
detectability: "yes"
kind: "element"
scope: "any"
selector: 'content'
fix: { op: "none" }
replacement: "Declare distribution points with `slot` in a v1 shadow root and assign nodes with the `slot` attribute."
tags: ["web-components"]
impacts: ["interop", "maintainability"]
related: ["element/shadow"]
---

`<content>` distributes nothing. `content` was the insertion point of Shadow DOM v0:
the placeholder
inside a shadow tree where the host's light-DOM children were distributed,
optionally filtered by a `select` query. It belonged to the pre-standard
era of Web Components, when Chrome shipped v0 behind its own
implementation while the standard was still being worked out.

It was never standardized in HTML, and the v1 standard replaced it with
`slot`. Chrome deprecated v0 with removal expected in Chrome 73 and then
removed it; the DOM Standard's shadow-tree model knows only slots and
slottables, with no insertion-point element.

## Why avoid

It was never a standard and every engine has moved on. `content` belonged
to the pre-standard Shadow DOM v0 era; the DOM Standard's shadow-tree
model knows only slots and slottables, with no insertion-point element.
Chrome deprecated v0 with removal expected in Chrome 73, noting it was
"not implemented in other browsers".

The last engine removed it years ago. The blink-dev removal thread retired
Shadow DOM v0, Custom Elements v0 and HTML Imports together (APIs disabled
in the M73/M74 window, code then removed); nothing renders a `<content>`
distribution point today.

The replacement is Baseline. MDN marks `<slot>` widely available across
browsers since January 2020, specified in both HTML (`#the-slot-element`)
and DOM (`#shadow-tree-slots`). Every engine ships it.

A leftover is silently dead. In a v1 tree a `<content>` element behaves as
an unknown element, so its `select` query distributes nothing while
looking like live component plumbing to the next reader.

## Use instead

Declare distribution points with `slot` in a v1 shadow root and assign
nodes with the `slot` attribute, keeping fallback content inside the
`slot`:

```html
<template id="badge-template">
  <span class="badge"><slot name="label">New</slot></span>
</template>
<my-badge><span slot="label">Sale</span></my-badge>
```

## Detectability

Fully detectable. The rule matches the bare element name `content`, with no
logic module: every instance is the obsolete insertion point. No other
HTML or SVG element shares the name, so the selector cannot false-positive;
the `content` attribute (for example on `<meta>`) is untouched by an
element selector.

There is no autofix. `content` can carry fallback content and a `select`
distribution query, so removing the element would delete rendered
fallback; rewriting the distribution as a v1 `slot` is a manual edit.

## Resources

- [DOM Standard: Slots](https://dom.spec.whatwg.org/#shadow-tree-slots): the standard shadow-tree model defines slots and slottables; there is no `content` insertion point.
- [Chrome for Developers: Deprecations and Removals in Chrome 70](https://developer.chrome.com/blog/chrome-70-deps-rems): Shadow DOM v0 deprecated with removal expected in Chrome 73, as an experimental version not implemented in other browsers.
- [MDN: `<slot>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/slot): Baseline, widely available since January 2020; the specified replacement, linking both the HTML and DOM definitions.
- [blink-dev: Intent to Deprecate and Remove: Shadow DOM V0, Custom Elements V0, HTML Imports](https://groups.google.com/a/chromium.org/g/blink-dev/c/h-JwMiPUnuU/m/8yiBD1SWAwAJ): the removal rationale (no other engines adopted v0) and timeline (disable, then remove the code).
