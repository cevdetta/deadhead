---
ruleId: "element/rb"
title: "<rb>"
description: "`rb` wraps ruby base text that can sit in `ruby`. The wrapper adds nothing. Omit it."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'rb'
fix: { op: "none" }
replacement: "Put the base text directly inside `ruby` (with `rt`, plus `rp` for fallback), or nest `ruby` elements for complex cases."
tags: ["text"]
impacts: ["interop", "maintainability"]
related: ["element/rtc"]
---

`<rb>` adds nothing. `rb` was the wrapper for ruby base text: the annotated
characters grouped
beside their `rt` pronunciation or gloss inside a `ruby` element. It comes
from the era when every base run needed an explicit container, before the
standard settled on bare base text directly inside `ruby`.

The HTML Standard lists it as entirely obsolete: providing the base
directly inside the `ruby` element, or using nested `ruby` elements, is
sufficient. Browsers still render the wrapper as its text content, so pages
look unchanged, and the dead markup survives every cleanup pass.

## Why avoid

It is entirely obsolete by spec. The HTML Standard's Non-conforming
features list says `rb` "must not be used by authors": providing the base
directly inside `ruby`, or nesting `ruby` elements, is sufficient.

The wrapper does nothing the parent doesn't. The `ruby` content model is
base text (plain phrasing content) plus `rt`/`rp` annotations. `rb`
appears nowhere in it. MDN's own no-`rb` rewrite of its example renders
identically.

It still renders, which is exactly the trap. W3C i18n test notes show
interleaved `rb`/`rt` rendering as expected in Chrome/Safari-era engines,
so nothing visibly breaks. MDN still warns the feature "may cease to work
at any time". Dead markup that works today is what survives every cleanup
pass.

It invites patterns no browser renders. Grouped `rb…rb…rt…rt` models
(jukugo-style grouping without nesting) render as expected in no browser
per the same W3C notes, and longhand `rb` everywhere is "a pain to author
and to read", raising the odds of misaligned base/annotation pairs.

## Use instead

Write the base characters directly, one annotation group at a time; nest
`ruby` for double-sided or grouped readings:

```html
<ruby>明日<rp>(</rp><rt>Ashita</rt><rp>)</rp></ruby>
```

## Detectability

Fully detectable. The rule matches the bare element name `rb`, with no
logic module: every instance is the obsolete wrapper.

There is no autofix. `rb` holds the base text itself, so removing the
element would delete the annotated characters along with the wrapper;
unwrapping it into bare base text is a manual edit.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): lists `rb` (with `rtc`) as entirely obsolete, with the direct-base-or-nested-ruby replacement wording.
- [MDN: `<rb>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rb): marks the element Deprecated, documents the no-`rb` equivalent, and points its specification link at the spec's obsolete `rb` section.
- [MDN: `<ruby>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby): Baseline, widely available; content model is base phrasing content plus `rt`/`rp` with no `rb`, and all examples are `rb`-free.
- [W3C: Ruby extension markup (i18n)](https://www.w3.org/International/notes/ruby-extension): test notes: interleaved `rb`/`rt` renders as expected in Chrome/Safari-era engines, grouped-only models in no browser, and full `rb` longhand is "a pain to author".
