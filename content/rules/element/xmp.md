---
ruleId: "element/xmp"
title: "xmp element"
description: "xmp is obsolete; it shows markup as literal text but can't hold character references or its own end tag, so use pre and code with < and & escaped."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "xmp"
fix: { op: "none" }
replacement: "Use <pre><code> and escape the content: < as &lt; and & as &amp;."
tags: ["legacy", "style"]
impacts: ["maintainability"]
related: ["element/listing", "element/plaintext"]
---

`<xmp>` cannot show its own end tag. `<xmp>` was a shortcut for showing HTML source on
a page: everything between `<xmp>` and `</xmp>`
appears as typed, in a monospace font, with no need to escape angle brackets. MDN traces it to
HTML 2, and it still turns up in old pages.

## Why avoid

It is obsolete. The HTML Standard lists `xmp` among the elements that "are entirely obsolete, and
must not be used by authors", with the instruction: "Use `pre` and `code` instead, and escape `<`
and `&` characters as `&lt;` and `&amp;` respectively."

The convenience comes with limits that are easy to trip over. The parser handles `<xmp>` with "the
generic raw text element parsing algorithm", which switches the tokenizer to the RAWTEXT state. In
that state nothing is markup, and that includes character references: the tokenizer only watches
for `<`, to find the end tag. Two things follow:

- **Character references show up literally.** Writing `&amp;` inside `xmp` displays the five
  characters `&amp;`, not an ampersand, so there is no way to write a character you can't type.
- **The content can never contain `</xmp>`.** The first `</xmp` ends the element, so a page can't
  use `xmp` to show markup that itself mentions `xmp`.

What remains is appearance. The rendering section styles it exactly like `pre`: display block,
`margin-block: 1em`, and `font-family: monospace; white-space: pre`. It says nothing about what the
content is. The HTML Accessibility API Mappings give `code` the WAI-ARIA `code` role, and `xmp` no
role at all.

## Use instead

Wrap the sample in `pre` and `code`, and escape `<` and `&`:

```html
<pre><code>&lt;p class="note"&gt;Tom &amp; Jerry&lt;/p&gt;</code></pre>
```

## Detectability

Fully detectable by tag name. The rule matches the tag outright, and the engine never
lints the content of an `xmp`, because a browser reads
it as text. Only the element itself is reported. There is no autofix: removing it would delete
the content, and moving to `pre` and `code` means renaming the element and escaping its content,
which a fix can't do.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `xmp` is obsolete; use `pre` and `code` with `<` and `&` escaped instead.
- [HTML Standard: Parsing: the "in body" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inbody): `xmp` uses the generic raw text element parsing algorithm, whose RAWTEXT state decodes no character references.
- [HTML Standard: Rendering: flow content](https://html.spec.whatwg.org/multipage/rendering.html#flow-content-3): `xmp` is displayed like `pre`: block, monospace, `white-space: pre`.
- [W3C: HTML Accessibility API Mappings](https://www.w3.org/TR/html-aam-1.0/#el-code): `code` maps to the ARIA `code` role.
- [MDN: `<xmp>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/xmp): deprecated since HTML 3.2, "not implemented in a consistent way"; use `pre` or `code`.
