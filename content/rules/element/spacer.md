---
ruleId: "element/spacer"
title: "spacer element"
description: "spacer is obsolete and does nothing in any current browser; the gap it was meant to add is gone, so set it with CSS margin or gap."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "spacer"
fix: { op: "none" }
replacement: "Delete it and add the space in CSS: margin on the neighbouring element, or gap on a flex or grid container."
tags: ["legacy", "style"]
impacts: ["maintainability"]
related: ["element/center", "element/nobr"]
---

`<spacer>` adds no space. `<spacer type="horizontal" size="40">` asked the browser for
a blank gap of a given size. It was a
Netscape extension from the days before CSS, used to push table cells and images apart.
Navigation links got the same treatment. It still turns up in old templates, between links
or at the start of a
paragraph.

## Why avoid

It is obsolete. The HTML Standard lists `spacer` among the elements that "are entirely obsolete,
and must not be used by authors", with the advice: "Use appropriate elements or CSS instead."

It also does nothing. The DOM section maps `spacer` to `HTMLUnknownElement`, and the rendering
section defines no styles for it. The browser ignores its `type`, `size`, `width`, `height` and
`align` attributes, so the space the author wanted is missing from the page, and nothing
warns anyone.

It isn't harmless either, because `spacer` is not a void element. The spec's list of void
elements, the ones that never have content, is `area`, `base`, `br`, `col`, `embed`, `hr`, `img`,
`input`, `link`, `meta`, `source`, `track` and `wbr`. `spacer` was almost always written without
an end tag, so the parser opens it as a normal element, and everything after it, up to the end of
its parent, becomes its content:

```html
<!-- written -->
<p>One<spacer size="40">Two <b>three</b></p>
<!-- parsed -->
<p>One<spacer size="40">Two <b>three</b></spacer></p>
```

The dead tag ends up wrapping live text. That changes which element is the parent of that
content, so child selectors and scripts that walk the DOM see a structure nobody intended.

## Use instead

Delete it and put the space in CSS. For a row of items, use `gap` on a flex or grid container:

```html
<nav class="toolbar">
  <a href="/">Home</a>
  <a href="/about">About</a>
</nav>
```

```css
.toolbar { display: flex; gap: 2.5rem; }
```

CSS Box Alignment describes the gap properties as specifying "fixed-length gutters between items
in the container". For space next to one element, use a margin on that element:

```css
.lead { margin-block-end: 1.5rem; }
```

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
an unclosed `spacer` contains the content that
follows it, so removing the element would delete that content.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `spacer` is entirely obsolete; use CSS instead.
- [HTML Standard: Elements in the DOM](https://html.spec.whatwg.org/multipage/dom.html#elements-in-the-dom): `spacer` maps to `HTMLUnknownElement`.
- [HTML Standard: Void elements](https://html.spec.whatwg.org/multipage/syntax.html#void-elements): `spacer` is not void, so an unclosed one wraps the content after it.
- [CSS Box Alignment Module Level 3: gap](https://www.w3.org/TR/css-align-3/#gap-shorthand): fixed-length gutters between items in flex, grid and multi-column containers.
