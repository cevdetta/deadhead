---
ruleId: "meta/http-equiv-set-cookie"
title: "meta http-equiv=set-cookie"
description: "http-equiv=set-cookie is non-conforming and has no effect; browsers ignore it, so set cookies with the Set-Cookie response header instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="set-cookie" i]'
fix: { op: "remove-element" }
replacement: "Send a Set-Cookie response header (or set document.cookie from script); then delete the tag."
tags: ["head", "meta"]
impacts: ["maintainability"]
related: ["meta/http-equiv-x-ua-compatible"]
---

`<meta http-equiv="set-cookie">` used to set cookies from markup. The HTML
Standard lists the pragma as non-conforming — "has no effect", and "user
agents are required to ignore" it — and browsers finished removing it years
ago: Chrome blocked it in M65, Firefox in 68, Edge alongside them.

## Why avoid

The cookie is never set, so whatever depended on the tag is already broken —
silently. The removal was a security hardening: a `set-cookie` pragma let a
non-script content injection manipulate cookies and upgrade itself toward
session fixation, even under a strong Content Security Policy. Requiring
either HTTP headers or script execution for cookies closed that vector.

What is left is a tag that looks like cookie management and does nothing.
Delete it, and move the cookie to where cookies actually live.

## Use instead

A response header:

```http
Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Lax
```

## Detectability

Fully detectable. The pragma is a single element identified by one attribute
value, so a selector match is the whole rule. The fix removes the element:
deletion loses nothing, because no browser reads it — but the author still
has to re-create the cookie as a header, which is why the replacement says
so explicitly.

## Resources

- [HTML Standard — Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives) — set-cookie is non-conforming, has no effect, and must be ignored.
- [Chrome 65 deprecations](https://developer.chrome.com/blog/chrome-65-deprecations) — the removal and its session-fixation rationale, with Intent-to-Remove and tracker links.
- [MDN — `<meta http-equiv>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/http-equiv) — browsers now ignore this pragma; use the Set-Cookie response header or document.cookie instead.
