---
ruleId: "meta/http-equiv-content-language"
title: "meta http-equiv=content-language"
description: "http-equiv=content-language is non-conforming; declare the page language with the lang attribute instead. Add lang before deleting this tag."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="content-language" i]'
fix: { op: "none" }
replacement: "Declare the language with <html lang> (and lang on embedded foreign-language passages)."
tags: ["head", "meta", "i18n"]
impacts: ["a11y"]
related: ["document/html-lang"]
---

Never use `<meta http-equiv="content-language">` for the page language. It was the
old way to state a page's
language in markup. The HTML Standard calls the pragma non-conforming:
"authors are encouraged to use the lang attribute instead", while W3C
internationalisation guidance says never to use this meta form for the page
language at all.

## Why avoid

The pragma is almost, but not quite, entirely unlike the `Content-Language`
HTTP header of the same name (the spec's own warning). The header signals
the intended *audience*; the pragma sets a *default language* that applies
only where no `lang` attribute does. Authors routinely confuse the two, and
the confusion runs both directions.

`lang` does more, everywhere it matters: screen readers, text-to-speech and
Braille devices pick pronunciation from it; translation, hyphenation,
spell-checking and font selection key off it. The pragma only fills gaps
where `lang` is absent, and in-page language always overrides header
information. There is no case where the pragma adds information `lang`
cannot carry better.

## Use instead

```html
<html lang="en">
```

```html
<p>The phrase <span lang="fr">c'est la vie</span> is French.</p>
```

## Detectability

Fully detectable. The rule reports one element and one attribute value, with no context
that changes
the verdict. There is deliberately no autofix. The pragma still sets the
pragma-set default language wherever no `lang` applies, so deleting the tag
before adding `lang` changes the document's computed language. Add `lang`
first, then delete this tag by hand.

## Resources

- [HTML Standard: Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives): content-language is non-conforming, use lang instead; sets the pragma-set default language.
- [W3C i18n: Declaring language in HTML](https://www.w3.org/International/questions/qa-html-language-declarations): never use this meta form for the page; always declare with lang on html.
- [MDN: `<meta http-equiv>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/http-equiv): content-language is a default for assistive tech and styling; use the lang attribute instead.
