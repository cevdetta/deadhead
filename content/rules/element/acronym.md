---
ruleId: "element/acronym"
title: "<acronym>"
description: "acronym is obsolete; browsers already treat it exactly like abbr, so use abbr."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "acronym"
fix: { op: "none" }
replacement: "Use abbr: <abbr title=\"World Wide Web\">WWW</abbr>."
tags: ["text"]
impacts: ["maintainability"]
related: ["element/tt", "element/big"]
---

Use `<abbr>`; `<acronym>` is obsolete. HTML 4 had two elements for shortened words:
`<abbr>` for abbreviations and `<acronym>` for
acronyms. Nobody agreed on where one ended and the other began. Is "HTML" an acronym if you
spell it out letter by letter? The distinction never did anything a reader or a browser could
use. HTML5 kept `<abbr>` and dropped `<acronym>`.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `acronym` among the elements that
"are entirely obsolete, and must not be used by authors", with a one-line instruction: "Use abbr
instead."

It adds nothing to `<abbr>`. The Standard requires that "user agents must treat acronym
elements in a manner equivalent to abbr elements in terms of semantics and for purposes of
rendering", and its default stylesheet gives `abbr[title]` and `acronym[title]` the same
dotted underline. Keeping `<acronym>` buys no meaning. It costs a validation error on every
page it appears on, and it keeps an element MDN describes as "a candidate for removal from web
standards or browsers". Default styling has varied too, with some browsers adding small caps.

## Use instead

```html
<abbr title="World Wide Web">WWW</abbr>
```

Because browsers already treat the two identically, swapping the tag name changes nothing a
reader sees or hears. Where the expansion matters, write it out in the text on first use as
well. A `title` is hard to reach from a touchscreen or keyboard.

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix,
even though replacing `acronym` with `abbr`
would be safe here. Fixes only ever remove markup, and renaming an element isn't a removal.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `acronym` is entirely obsolete: "Use abbr instead."
- [HTML Standard: Other elements, attributes and APIs](https://html.spec.whatwg.org/multipage/obsolete.html#other-elements,-attributes-and-apis): user agents must treat `acronym` as equivalent to `abbr` in semantics and rendering.
- [MDN: `<acronym>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/acronym): deprecated, a candidate for removal; use `<abbr>`.
