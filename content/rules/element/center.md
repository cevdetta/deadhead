---
ruleId: "element/center"
title: "center element"
description: "center is obsolete presentational markup for horizontal centering; do it in CSS with text-align: center for text and margin-inline: auto for blocks."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "center"
fix: { op: "none" }
replacement: "Center in CSS: text-align: center for text and inline content, margin-inline: auto for a block with a width."
tags: ["legacy", "style"]
impacts: ["maintainability"]
related: ["element/big", "attr/table-presentational"]
---

Centering belongs in CSS, not in `<center>`. `<center>` wraps content and centers it
horizontally. It was the only way to do that before CSS,
and it is so easy to type that it still shows up in email templates, CMS output and pages
pasted together from old examples. It works, which is the problem: it's a layout decision
that lives in the markup instead of the stylesheet.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `center` among the elements that "are
entirely obsolete, and must not be used by authors", with `font`, `big` and `tt`, and the
instruction "Use appropriate elements or CSS instead."

It is presentation with no meaning. The Standard keeps it rendering: a `center` element is
"expected to center text within [itself], as if [it] had [its] 'text-align' property set to
'center' in a presentational hint, and to align descendants to the center". It carries no
semantics, only the plain `HTMLElement` interface. Layout written into markup is out of the
stylesheet's reach. A breakpoint that should left-align on narrow screens, a print style or a
theme has to fight a presentational hint, and the next person looking for "why is this centered"
searches the CSS and finds nothing.

It also does two things, which makes removing it trickier than it looks. "Align descendants to the
center" centers child *blocks* as well as text, and `text-align: center` alone doesn't. MDN
spells out the difference: `text-align` centers only an element's contents and "does not center
the block itself", for which you need auto margins. Swapping every `<center>` for a `text-align`
rule will quietly move some layouts.

## Use instead

Decide what is being centered, and say so in CSS:

```css
.intro { text-align: center; }                    /* text and inline content */
.card  { max-width: 40rem; margin-inline: auto; } /* a block with a width */
```

```html
<p class="intro">Centered text.</p>
<div class="card">A centered block.</div>
```

For whole layouts, `display: flex` with `justify-content: center`, or `display: grid` with
`place-items: center`, centers children without the element.

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
`center` still changes the layout, so removing
it would un-center the content, and the right replacement depends on what is inside.

A `div` with `align="center"` renders the same way but is an obsolete attribute, not this element,
and the rule doesn't match it.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `center` is entirely obsolete: "Use appropriate elements or CSS instead."
- [HTML Standard: Rendering: flow content](https://html.spec.whatwg.org/multipage/rendering.html#flow-content-3): `center` centers text as if `text-align: center`, and aligns descendants to the center.
- [MDN: `<center>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/center): deprecated; `text-align: center` for contents, auto margins for blocks, and why they differ.
