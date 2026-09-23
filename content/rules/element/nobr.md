---
ruleId: "element/nobr"
title: "nobr element"
description: "nobr is obsolete presentational markup that stops text wrapping; set white-space: nowrap in CSS instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "nobr"
fix: { op: "none" }
replacement: "Wrap the text in a span and set white-space: nowrap on it in CSS. If it contained <wbr>, also give those wbr { white-space: normal }."
tags: ["presentational"]
impacts: ["maintainability"]
related: ["element/center", "element/big"]
---

`<nobr>` hard-codes wrapping into the markup. `<nobr>` keeps its text on one line: the
browser won't wrap it, however narrow the space gets.
It dates from before CSS could say the same thing, and it still turns up around phone numbers,
prices, product names and dates in old templates.

## Why avoid

It is obsolete. The HTML Standard lists `nobr` among the elements that "are entirely obsolete,
and must not be used by authors", with the advice: "Use appropriate elements or CSS instead."

All it does is set one CSS property. The spec's user-agent stylesheet contains
`nobr { white-space: nowrap; }`, and the DOM section maps the element to plain `HTMLElement`,
with no interface of its own. It carries no meaning and exposes nothing to assistive technology.
What remains is a presentation choice hard-coded into the markup. It can't be switched off at a
breakpoint, restyled from a stylesheet or reused, and every copy has to be found and edited by
hand.

## Use instead

Put the text in a `<span>` and let CSS stop the wrapping:

```html
<p>Call <span class="nowrap">+41 44 123 45 67</span> for bookings.</p>
```

```css
.nowrap { white-space: nowrap; }
```

CSS Text defines `nowrap` as: "Like normal, this value collapses white space; but like pre, it
does not allow wrapping." That is exactly what `<nobr>` did.

One detail is easy to lose. Inside `<nobr>`, a `<wbr>` still marks a place where the line
breaks: the user-agent stylesheet also says `nobr wbr { white-space: normal; }`. A plain
`nowrap` span doesn't do that. If the old markup relied on `<wbr>`, add the same reset:

```css
.nowrap wbr { white-space: normal; }
```

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
removing the element would delete the text
inside it, and fixes can't unwrap an element to keep its content.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `nobr` is entirely obsolete; use CSS instead.
- [HTML Standard: Rendering: phrasing content](https://html.spec.whatwg.org/multipage/rendering.html#phrasing-content-3): the user-agent stylesheet: `nobr { white-space: nowrap; }` and `nobr wbr { white-space: normal; }`.
- [HTML Standard: Elements in the DOM](https://html.spec.whatwg.org/multipage/dom.html#elements-in-the-dom): `nobr` maps to plain `HTMLElement`, with no interface of its own.
- [CSS Text Module Level 3: white-space: nowrap](https://www.w3.org/TR/css-text-3/#valdef-white-space-nowrap): the replacement collapses white space and does not allow wrapping.
