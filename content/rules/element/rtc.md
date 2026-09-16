---
ruleId: "element/rtc"
title: "rtc element"
description: "`rtc` held second-side ruby annotations for Gecko only. Chromium and WebKit misplace them. Nest `ruby` for all engines."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'rtc'
fix: { op: "none" }
replacement: "Nest `ruby` elements for double-sided annotations, with `ruby-position` CSS to place each side."
tags: ["legacy"]
impacts: ["interop", "maintainability"]
related: ["element/rb"]
---

`<rtc>` breaks outside Gecko. `rtc` was the container for a second side of ruby
annotations: the extra
pronunciation or gloss grouped in `rt` elements beside a base written
directly inside `ruby`. It belonged to the old `rb` / `rtc` double-sided
pattern, where one `ruby` carried two annotation rows.

The HTML Standard lists it as entirely obsolete: providing the base
directly inside `ruby`, or nesting `ruby` elements, is sufficient. Only
Gecko ever laid the container out; Chromium and WebKit parse the markup
but misplace its annotations.

## Why avoid

It is entirely obsolete by spec. The HTML Standard's Non-conforming
features list says `rtc` "must not be used by authors": base text directly
inside `ruby`, or nested `ruby` elements, is sufficient.

It visibly breaks outside Gecko. The W3C i18n article's current
per-engine results (Chrome 147, Firefox 149, Safari 26.2) mark every `rtc`
double-sided pattern as failing in Blink and WebKit: "The other browsers
fail to produce a useful layout when dealing with 'double-sided' ruby…
although they parse the markup correctly." Most readers get misplaced
annotations.

The replacement is proven everywhere. The same article marks nested-`ruby`
equivalents as passing across Blink, Gecko and WebKit.

Even the Gecko rendering it relies on is borrowed time. MDN marks `rtc` Deprecated:
it "may cease to work at any time".

## Use instead

Nest one `ruby` inside another, one annotation per level, and place the
sides with CSS:

```html
<style>ruby { ruby-position: under; } ruby ruby { ruby-position: over; }</style>
<ruby><ruby>東<rt>とう</ruby><rt>tatsumi</rt></ruby>の方角
```

## Detectability

Fully detectable. The rule matches the bare element name `rtc`, with no
logic module: every instance is the obsolete container.

There is no autofix. `rtc` holds the semantic annotation text, so removing
the element would delete the annotation itself; rewriting it as nested
`ruby` is a manual edit.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): lists `rtc` (with `rb`) as entirely obsolete, with the direct-base-or-nested-ruby replacement wording.
- [MDN: `<rtc>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rtc): marks the element Deprecated with an `HTMLElement` interface, pointing its specification link at the spec's obsolete `rtc` section.
- [W3C: Ruby Markup (i18n)](https://www.w3.org/International/articles/ruby/markup): current per-engine table (Chrome 147 / Firefox 149 / Safari 26.2): `rtc` double-sided patterns fail in Blink and WebKit, nested-`ruby` equivalents pass in all three.
