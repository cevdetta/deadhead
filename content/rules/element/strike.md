---
ruleId: "element/strike"
title: "strike element"
description: "strike is obsolete: it draws a line through text but tells assistive technology nothing; use del for a removal or s for text that is no longer accurate."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "strike"
fix: { op: "none" }
replacement: "Use <del> if the text was removed from the document, or <s> if it is no longer accurate or relevant, such as an old price."
tags: ["text"]
impacts: ["a11y", "maintainability"]
related: ["element/font", "element/center"]
---

`<strike>` means nothing to assistive technology. `<strike>` draws a line through its
text. It is presentational markup from before CSS, and it
still turns up for crossed-out prices and corrected dates in old pages and pasted
rich text.

## Why avoid

It is obsolete, and the HTML Standard names the replacement: "Use `del` instead if the element is
marking an edit, otherwise use `s` instead."

The look was never the problem. The spec's user-agent stylesheet treats all three elements the
same: `del, s, strike { text-decoration: line-through; }`. The difference is meaning. The `s`
element "represents contents that are no longer accurate or no longer relevant", and `del`
"represents a removal from the document". `strike` means neither. The DOM section maps it to plain
`HTMLElement`, with no semantics of its own.

That difference reaches people who can't see the line. The HTML Accessibility API Mappings map
both `del` and `s` to the WAI-ARIA `deletion` role, so browsers can tell assistive technology
that the text is struck. There is no mapping for `strike` at all. It is exposed as ordinary text,
and nothing tells assistive technology that the old price or the cancelled date is struck out.

## Use instead

Pick by meaning. Use `s` for something that is no longer accurate or relevant:

```html
<p>Price: <s>CHF 49</s> CHF 29</p>
```

Use `del` for text removed from the document, optionally with `ins` for what replaced it and
`datetime` for when:

```html
<p>Meeting on <del datetime="2026-09-14">Tuesday</del> <ins>Thursday</ins>.</p>
```

The spec is explicit that `s` "is not appropriate when indicating document edits". If the line is
purely decorative and means nothing, use CSS `text-decoration: line-through` on a `<span>`.

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
fixes can only remove markup, not rename it,
and choosing between `del` and `s` depends on what the text means.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `strike` is obsolete; use `del` for edits, otherwise `s`.
- [HTML Standard: The s element](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-s-element): contents that are no longer accurate or relevant; not for document edits.
- [HTML Standard: The del element](https://html.spec.whatwg.org/multipage/edits.html#the-del-element): a removal from the document.
- [HTML Standard: Rendering: phrasing content](https://html.spec.whatwg.org/multipage/rendering.html#phrasing-content-3): `del, s, strike { text-decoration: line-through; }`, the same look for all three.
- [W3C: HTML Accessibility API Mappings](https://www.w3.org/TR/html-aam-1.0/#el-s): `s` and `del` map to the ARIA `deletion` role; `strike` has no mapping.
