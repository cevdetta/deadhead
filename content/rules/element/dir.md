---
ruleId: "element/dir"
title: "dir element"
description: "The dir element is obsolete; browsers already treat it exactly like ul, so use ul. The global dir attribute is unrelated and current."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "dir"
fix: { op: "none" }
replacement: "Use ul: <ul><li>index.html</li></ul>. Make it compact with CSS, not the obsolete compact attribute."
tags: ["legacy", "body"]
impacts: ["maintainability"]
related: ["element/acronym"]
---

`<dir>` was HTML's list for directory listings, a list of file names that browsers might one
day show with icons or in columns. None of them ever did anything special with it. It rendered as
an ordinary bulleted list from the start, and the name has only caused confusion since.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `dir` among the elements that "are
entirely obsolete, and must not be used by authors", and the instruction is four words: "Use ul
instead."

It is already a `ul`. The Standard requires that "user agents must treat dir elements in a manner
equivalent to ul elements in terms of semantics and for purposes of rendering". Its default
stylesheet lists `dir` next to `ul` in every list rule: the same block display, the same margins,
the same 40-pixel indent. The directory presentation it was named for never existed, so keeping it
buys nothing and costs a validation error.

The name also collides with something that matters. The global `dir` attribute, as in
`dir="rtl"` or `dir="auto"`, sets text direction and is essential for right-to-left languages.
The `<dir>` element has nothing to do with it, as MDN points out. A codebase search for `dir`
turns up both, and a list element sharing its name with a bidirectional-text setting helps no one.
Its one attribute, `compact`, "doesn't work in all browsers" either.

## Use instead

```html
<ul class="files">
  <li>index.html</li>
  <li>styles.css</li>
</ul>
```

```css
.files { list-style: none; padding-inline-start: 1rem; line-height: 1.3; }
```

Because browsers already treat `<dir>` as `<ul>`, swapping the tag name changes nothing a reader
sees or hears.

## Detectability

Fully detectable by tag name. The selector matches the `dir` element only, never the `dir`
attribute on other elements.

There is no autofix, even though renaming `dir` to `ul` would be safe. Fixes only ever remove
markup, and renaming an element isn't a removal.

## Resources

- [HTML Standard — Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features) — `dir` is entirely obsolete: "Use ul instead."
- [HTML Standard — Other elements, attributes and APIs](https://html.spec.whatwg.org/multipage/obsolete.html#other-elements,-attributes-and-apis) — user agents must treat `dir` as equivalent to `ul` in semantics and rendering.
- [HTML Standard — Rendering: lists](https://html.spec.whatwg.org/multipage/rendering.html#lists) — `dir` shares every default list style with `ul`.
- [MDN — `<dir>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dir) — removed from standards; use `<ul>`; `compact` is unreliable; not the global `dir` attribute.
