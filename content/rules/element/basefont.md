---
ruleId: "element/basefont"
title: "<basefont>"
description: "Browsers hide basefont; set the font in CSS instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "basefont"
fix: { op: "none" }
replacement: "Set the document font in CSS: body { font-family: system-ui, sans-serif; font-size: 1rem; color: #222; }."
tags: ["presentational"]
impacts: ["maintainability"]
related: ["element/font", "element/acronym"]
---

`<basefont>` sets nothing. `<basefont size="4" color="navy" face="Verdana">` was meant
to set the default font for a
whole document in one place, so every later `<font size="+1">` would count from it. Internet
Explorer honoured it. Netscape and its successors never did. Today it is a line of markup that
looks as if it sets the page's type, and sets nothing.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `basefont` among the elements that
"are entirely obsolete, and must not be used by authors", alongside `font`, `center`, `big` and
`tt`, with the instruction "Use appropriate elements or CSS instead."

It has no effect. The Standard's rendering rules put `basefont` in the list of elements styled
`display: none`, and define nothing for its `size`, `color` or `face` attributes. Firefox never
applied it at all: Mozilla's bug for it, "deprecated `<basefont>` element not supported", was
closed WONTFIX, with Ian Hickson's advice that "Authors should not use deprecated elements,
certainly not in new documents. Use CSS instead."

That makes it misleading rather than harmless. Anyone maintaining the page reads it as the
source of the site's base font size and colour, keeps it through redesigns, and wonders why
changing it does nothing. The real styling lives somewhere else, and this line only hides that.

## Use instead

Set the document's font once, in CSS:

```css
body {
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  color: #222;
}
```

Relative sizes such as `rem` and `em` then count from that, which is what `basefont` was trying
to offer.

## Detectability

Fully detectable by tag name. The rule matches the tag outright, in `<head>` or `<body>`:
the parser handles `basefont` like
`<link>` wherever it appears, as a void element with no end tag.

There is no autofix. Deleting it would change nothing a reader sees, since it does nothing,
but whether to remove it is left to the author.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `basefont` is entirely obsolete: "Use appropriate elements or CSS instead."
- [HTML Standard: Rendering: hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements): `basefont` is `display: none`, with no presentational hints for its attributes.
- [HTML Standard: Parsing: the "in head" insertion mode](https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inhead): `basefont` start tags are processed with `base`, `bgsound` and `link`.
- [Mozilla Bugzilla 3875: deprecated `<basefont>` element not supported](https://bugzilla.mozilla.org/show_bug.cgi?id=3875): resolved WONTFIX: Firefox never applied it.
