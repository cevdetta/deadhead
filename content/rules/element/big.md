---
ruleId: "element/big"
title: "<big>"
description: "big adds no meaning; use CSS font-size or the element that names the reason."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "big"
fix: { op: "none" }
replacement: "Size text in CSS: .lead { font-size: 1.25rem; }. If the size meant something, use the element for that meaning: a heading, strong or mark."
tags: ["presentational"]
impacts: ["maintainability", "a11y"]
related: ["element/font", "element/basefont"]
---

`<big>` sizes text without saying why. `<big>Sale ends Friday</big>` makes those words
bigger than the text around them, and that is
all it does. It dates from when HTML was also the styling language. It still works, which is
exactly why it survives: it looks like it's doing something useful, while telling a browser,
a screen reader and a search engine nothing about why the text is bigger.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `big` among the elements that "are
entirely obsolete, and must not be used by authors", with `font`, `center` and `tt`, and the
instruction "Use appropriate elements or CSS instead."

Its only behaviour is a font size. The Standard's rendering section gives it one rule,
`big { font-size: larger; }`: one step up from the surrounding text, capped at the browser's
largest size, as MDN puts it. Nothing else comes with it. It has no semantics and no role,
only the plain `HTMLElement` interface. So the reason the author made the text bigger (a
heading, a warning, a highlight) reaches sighted readers and no one else.

The Standard spells out what those reasons should be instead: "if the big element is being used
to denote a heading, consider using the h1 element; if it is being used for marking up important
passages, consider the strong element; and if it is being used for highlighting text for
reference purposes, consider the mark element."

Its size isn't one you choose, either. `larger` is relative to whatever contains it and compounds
when nested, so `<big><big>` inside a small caption and inside a hero render at different sizes,
and neither is a value from your type scale.

## Use instead

Put the size in CSS, and the meaning in the element:

```css
.lead { font-size: 1.25rem; }
```

```html
<p class="lead">An introductory paragraph.</p>
<p><strong>Back up your data before upgrading.</strong></p>
```

`<small>` is not the obsolete counterpart of `<big>`. It is a current element for side comments
and small print, and it stays.

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
`big` still changes how text renders, so
removing it or unwrapping its content would visibly change the page.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `big` is entirely obsolete; use `h1`, `strong` or `mark` for what it was standing in for.
- [HTML Standard: Rendering: phrasing content](https://html.spec.whatwg.org/multipage/rendering.html#phrasing-content-3): `big { font-size: larger; }`, its only defined behaviour.
- [MDN: `<big>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/big): removed from the specification; one size larger, capped at the browser maximum; use CSS `font-size`.
