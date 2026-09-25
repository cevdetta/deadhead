---
ruleId: "element/font"
title: "<font>"
description: "font is obsolete presentational markup that still styles text through color, face and size hints; move the styling to CSS."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "font"
fix: { op: "none" }
replacement: "Style in CSS: color, font-family and font-size on a class, or use strong, em or mark if the styling carried meaning."
tags: ["presentational"]
impacts: ["maintainability", "a11y"]
related: ["element/basefont", "element/big"]
---

`<font>` styles text without saying why. `<font color="red" face="Arial" size="5">` set
a run of red Arial at size 5
before stylesheets existed. It is the emblem of 1990s markup. Email templates and
WYSIWYG editor output still emit it, as does content pasted in from word processors.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `font` among the elements that "are
entirely obsolete, and must not be used by authors", with `basefont`, `big`, `center` and `tt`,
and the instruction "Use appropriate elements or CSS instead."

It still works, which is how it spreads. The Standard's rendering rules keep all three attributes
alive as presentational hints: `color` sets the `color` property, `face` sets `font-family`, and
`size` sets `font-size` through "the rules for parsing a legacy font size", the old 1-to-7 scale
with relative `+2` and `-1` steps. The page's typography ends up spread across the content, one
element at a time. A stylesheet can't restyle it in one place, and a redesign turns into an edit of
every document that contains it.

It is also forgiving in a way that hides mistakes. Its `color` attribute is read with "the rules
for parsing a legacy color value", which "replace any character in input that is not an ASCII hex
digit with U+0030 (0)" rather than rejecting the value. A misspelled colour name doesn't fail. It
turns into some other colour, where CSS would have discarded the invalid declaration.

And it means nothing. `<font color="red">Payment failed</font>` looks urgent, but the element
carries no semantics, so a screen reader reads it as plain text.

## Use instead

Put the style in CSS, and the meaning in an element that has one:

```css
.notice {
  color: #b00020;
  font-family: Georgia, serif;
  font-size: 1.25rem;
}
```

```html
<p class="notice"><strong>Payment failed.</strong> Please try again.</p>
```

Each attribute has a direct CSS counterpart: `color` becomes `color`, `face` becomes
`font-family`, and `size` becomes `font-size`.

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
`font` still applies its colour, typeface and
size, so removing it would visibly change the text.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `font` is entirely obsolete: "Use appropriate elements or CSS instead."
- [HTML Standard: Rendering: phrasing content](https://html.spec.whatwg.org/multipage/rendering.html#phrasing-content-3): `color`, `face` and `size` on `font` are presentational hints for `color`, `font-family` and `font-size`.
- [HTML Standard: Parsing a legacy color value](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-a-legacy-colour-value): non-hex characters are replaced with `0` instead of being rejected.
- [MDN: `<font>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/font): deprecated; its attributes and their CSS replacements.
