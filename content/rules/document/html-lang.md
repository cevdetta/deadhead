---
ruleId: "document/html-lang"
title: "html element without a lang"
description: "An <html> without a non-empty lang leaves the page's language unknown, so screen readers guess how to pronounce it; WCAG 3.1.1, Level A."
pubDate: "2026-09-13"
status: "avoid"
severity: "harmful"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "any"
selector: "html"
match: "logic"
fix: { op: "none" }
replacement: "Declare the page's language on the root element with a BCP 47 tag: <html lang=\"en\">."
tags: ["i18n"]
impacts: ["a11y", "seo"]
related: ["head/viewport-missing"]
---

`<html>` with no `lang`, or with `lang=""`, doesn't say what language the page is written
in. Browsers and assistive technology still have to render and read it in *some* language,
so they fall back to a guess, the user's own default, whatever language the page contains.

## Why avoid

The HTML Standard makes the gap explicit. `lang` takes "a valid BCP 47 language tag, or
the empty string", and the empty string means the language is *unknown*. With no `lang`
on any ancestor, the language comes from a `Content-Language` pragma or header if there is
one, and otherwise stays unknown. The Standard's advice is direct: "authors should specify
the lang attribute on the root html element".

That makes it a Level A accessibility failure. WCAG 2.2 SC 3.1.1 Language of Page requires
that "the default human language of each web page can be programmatically determined", so
that "screen readers can load the correct pronunciation rules". Without it, a screen reader
reads the page with the user's default voice. A French page read by English speech rules
is barely intelligible, and a braille display gets the wrong contractions.

A header doesn't make up for it. The W3C ACT rule for this criterion accepts only a `lang`
attribute that is "neither empty nor only ASCII whitespace". Language set through HTTP
headers or `<meta>` is "not supported by all assistive technologies", and `xml:lang` on its
own fails. The same missing value degrades everything else that keys off language:
browser translation offers and spell-checking in form fields. `hyphens: auto` and font
selection for CJK text key off it too.

## Use instead

```html
<!doctype html>
<html lang="en">
```

Use a BCP 47 tag, like `en`, `en-GB`, `de-CH` or `zh-Hant`. Mark any passage in a different
language on its own element: `<span lang="fr">c'est la vie</span>`.

## Detectability

Fully detectable. The selector finds `<html>`, and the logic reports it when `lang` is
missing, empty or only whitespace. A selector alone can't express the whitespace case.
The rule does not check whether a present value is a *valid* language tag.

Like `head/viewport-missing`, nothing is reported unless the document has a `<head>` with at least
one element in it, so fragments, partials and component templates don't fire. The rule
still reports a document
that only ever loads inside an `<iframe>`, because a file on disk can't
know it will be framed. Mark that case with `<!-- deadhead-disable document/html-lang -->`.

There is no autofix: the value is the page's language, which only the author knows.

## Resources

- [HTML Standard: the lang and xml:lang attributes](https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes): the empty string means unknown; the fallback chain; "authors should specify the lang attribute on the root html element".
- [W3C: Understanding WCAG 2.2 SC 3.1.1: Language of Page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html): the Level A criterion, pronunciation rules for screen readers, and technique H57.
- [W3C ACT rule b5c3f8: HTML page has lang attribute](https://www.w3.org/WAI/standards-guidelines/act/rules/b5c3f8/): `lang` must be neither empty nor only whitespace; headers, `<meta>` and `xml:lang` alone don't satisfy it.
