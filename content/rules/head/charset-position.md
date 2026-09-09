---
ruleId: "head/charset-position"
title: "charset declared after the first 1024 bytes"
description: "The encoding declaration must be fully inside the first 1024 bytes or the parser never sees it."
pubDate: "2026-09-09"
status: "avoid"
severity: "harmful"
standardsBasis: "spec"
detectability: "yes"
kind: "document"
scope: "head"
match: "logic"
fix: { op: "none" }
replacement: "Move <meta charset=\"utf-8\"> to the first line inside <head>, before <title> and before any other meta or link."
tags: ["head", "charset", "meta", "i18n", "security"]
impacts: ["interop", "security"]
related: ["meta/http-equiv-x-ua-compatible"]
---

Before a browser can parse a document it has to decide how to decode the bytes. With no
HTTP `charset` parameter and no byte order mark, it runs a *prescan*: it reads the start
of the byte stream looking for an encoding declaration, and the HTML Standard caps that
prescan at 1024 bytes. An encoding declaration that is not completely serialized inside
that window does not exist as far as the parser is concerned.

## Why avoid

Past the window, the browser falls back to a locale-dependent guess and may then discover
the real declaration mid-parse — at which point it has to throw away the tree and reparse
the document from the beginning. The visible failure is mojibake: `café` rendered as
`cafÃ©` for some visitors and correctly for others, depending on their locale, which is
exactly the kind of bug that does not reproduce on the developer's machine.

It is a security boundary as well as a correctness one. When the encoding is guessed
rather than declared, an attacker who controls part of the page can influence how the
rest of it is decoded, which is the mechanism behind the classic UTF-7 XSS: markup that
is inert under UTF-8 becomes active script under a guessed encoding.

The rule is easy to trip without noticing. A long `<title>`, a block of Open Graph tags,
an inline critical-CSS `<style>`, or a comment banner ahead of the declaration will each
push it past 1024 bytes, and nothing warns you.

## Use instead

Put the declaration first, before anything else in `<head>`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>…</title>
  </head>
</html>
```

Sending `Content-Type: text/html; charset=utf-8` on the response is stronger still — it
is authoritative and needs no prescan — but keep the `<meta>` too, so the file stays
correct when it is opened from disk or served by something you do not control.

## Detectability

Detectable wherever the original source text is available, which is why this is a
`kind: "document"` rule: no selector can express "ends after byte 1024". The logic
compares the declaration's end offset against the limit, so it reports in the CLI and the
ESLint plugin but stays silent in the browser adapter, where a live DOM node has no
source offsets to compare.

Two deliberate limits. It measures offsets in characters rather than bytes, and any
non-ASCII byte ahead of the declaration only makes the true count larger — so the check
can under-report but never invents a finding. And it looks at `<meta charset>` only: an
`http-equiv="Content-Type"` declaration is bound by the same 1024 bytes, but deciding
whether one is a *valid* declaration means parsing its `content`, and that is a separate
rule.

## Resources

- [HTML Standard — character encoding declaration](https://html.spec.whatwg.org/multipage/semantics.html#charset) — "must be serialized completely within the first 1024 bytes".
- [HTML Standard — prescan a byte stream to determine its encoding](https://html.spec.whatwg.org/multipage/parsing.html#prescan-a-byte-stream-to-determine-its-encoding) — the 1024-byte cap, and the reparse that follows a late discovery.
- [W3C Internationalization — declaring character encodings](https://www.w3.org/International/questions/qa-html-encoding-declarations) — the practical guidance, including the HTTP header interaction.
