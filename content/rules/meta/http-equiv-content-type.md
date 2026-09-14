---
ruleId: "meta/http-equiv-content-type"
title: "meta http-equiv=\"content-type\""
description: "http-equiv=content-type is a verbose alias for the charset declaration that the spec forbids combining with `<meta charset>`; declare the encoding once, with `<meta charset>` or the Content-Type header."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="content-type" i]'
fix: { op: "none" }
replacement: "Declare the encoding once, then delete the tag. Preferred: the Content-Type response header; otherwise <meta charset=\"utf-8\"> as the first element inside <head>."
tags: ["head", "meta"]
impacts: ["maintainability", "interop"]
related: ["head/charset-position", "meta/http-equiv-content-language"]
---

Before `<meta charset>` existed, the way to declare a document's encoding in markup
was the `content-type` pragma: `<meta http-equiv="content-type">` with a
`text/html; charset=…` content value. It survives as a conforming alias for the
charset declaration, which is exactly why it lingers — nothing visibly breaks, so the
tag gets copied forward. Prevalence data finds it on around 4.5M sites.

## Why avoid

It is strictly worse than the alternatives in three ways. First, the spec forbids
the most common real-world shape: a document must not contain both
`http-equiv=content-type` and `<meta charset>`, yet roughly 900k pages carry both
(plus the header) and are plainly invalid. There is only ever one encoding, so
declaring it twice in two spellings is a contradiction waiting to drift.

Second, it burns the 1024-byte prescan budget. The encoding declaration only works
if the parser meets it inside the first 1024 bytes, and the long
`text/html; charset=…` spelling pushes it further from the byte start than
`<meta charset>` does — closer to the window where the parser stops looking
(see `head/charset-position`).

Third, the wild values are often wrong. Conforming content is
`text/html; charset=utf-8`; anything else is non-conforming, and legacy
`iso-8859-1` or `windows-1252` spellings pin a document to an encoding the modern
web has left. The Content-Type header avoids the placement constraint entirely;
where headers are unreachable, `<meta charset>` says the same thing in 22 bytes.

## Use instead

Declare the encoding once, then delete the tag. Preferred is the response header:

```http
Content-Type: text/html; charset=utf-8
```

Where headers are unreachable, a single charset declaration as the first element
inside `<head>`:

```html
<head>
  <meta charset="utf-8">
  …
</head>
```

Add the replacement first and only then remove the pragma — deleting this tag
without one loses the document's only encoding declaration.

## Detectability

Fully detectable with a selector only: `meta[http-equiv="content-type" i]`. One
element, one attribute value; no context changes the verdict, and the match is
case-insensitive because `http-equiv` values are ASCII case-insensitive.

There is no autofix. Unlike an unread tag, deletion alone can lose the document's
only encoding declaration, so the author adds `<meta charset>` or the header
first and then deletes — the same rationale as
`meta/http-equiv-content-language`.

## Resources

- [HTML Standard — Pragma directives, Encoding declaration state](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives) — content-type is an alternative form of the charset declaration; content must match `text/html; charset=utf-8`; a document must not contain both forms; forbidden in XML documents.
- [MDN — `<meta http-equiv>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/http-equiv) — content-type is equivalent to a `<meta>` element with the charset attribute and carries the same placement restriction; only a subset of headers are supported as http-equiv values.
- [You probably don't need http-equiv meta tags](https://rviscomi.dev/2023/07/you-probably-dont-need-http-equiv-meta-tags/) — prevalence (~4.5M sites, trailing the header 3.4x and charset 2.8x), the 1-in-20 invalid both-or-neither combinations, and the prefer-header-then-charset recommendation.
