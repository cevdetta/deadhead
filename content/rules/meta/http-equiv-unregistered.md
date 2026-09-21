---
ruleId: "meta/http-equiv-unregistered"
title: "meta http-equiv with an unregistered value"
description: "A meta tag whose http-equiv value is no registered pragma keyword."
pubDate: "2026-09-21"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv]'
match: "logic"
fix: { op: "none" }
replacement: "Delete the tag. Send header work as a response header from the server; enroll in trials through the Origin-Trial response header instead of markup."
tags: ["head", "meta", "legacy"]
impacts: ["maintainability"]
related: ["meta/http-equiv-header-only", "meta/http-equiv-cache"]
---

A `meta` tag whose `http-equiv` value is no registered pragma keyword trips this rule. Such a tag is dead weight, or it turns into dead weight when its trial token expires.

## Why avoid

WHATWG defines `http-equiv` as a closed table of seven keywords: `content-language`, `content-type`, `default-style`, `refresh`, `set-cookie`, `x-ua-compatible` and `content-security-policy`. A value outside that table maps to no state, so the parser runs no pragma algorithm for the tag.

MDN warns that some browsers honour extra headers beyond the list while others skip them, so an unregistered tag behaves one way in one engine and another way elsewhere. MDN also warns against placing security headers in `meta http-equiv`: the tag looks like protection while it grants none.

The dead weight adds up. Stale names such as `pragma`, `expires` or `pics-label` linger in old markup long after servers stop sending the matching headers. Each tag costs bytes and review time for zero effect.

`origin-trial` is the sharp edge of the same table. It has no WHATWG entry, so conformance-wise it is unregistered, yet Chromium and Firefox enroll trials from the tag today. Chrome documents the `Origin-Trial` response header as an equivalent enrollment path, so the tag can move out of markup. Tokens expire, so a tag left in `head` rots into dead weight on its own.

## Use instead

Send header work as a response header. The server is the place where cache lifetimes, security policy and trial tokens take effect.

```http
Cache-Control: no-store
```

Keep `meta http-equiv` for the registered set alone. For trials, enroll through the header:

```http
Origin-Trial: TOKEN_GOES_HERE
```

## Detectability

Each `meta` tag with an unregistered `http-equiv` value trips the rule. The `meta[http-equiv]` selector is a prefilter alone: the verdict lives in `packages/rules/logic/meta/http-equiv-unregistered.ts`, which holds the seven-item allowlist and flags the rest. Values fold to ASCII lowercase before the check, so `PRAGMA` trips the rule while `Refresh` stays quiet. The rule reports without autofixing: `origin-trial` enrolls trials in Chromium and Firefox today, so deleting the tag would drop live behavior.

## Resources

- [WHATWG HTML: pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-http-equiv): the closed keyword table and the per-state processing model.
- [MDN: `<meta http-equiv>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/http-equiv): the supported subset, the ignored remainder and the warning on security headers in `meta`.
- [Chrome: take part in an origin trial](https://developer.chrome.com/docs/web-platform/origin-trials/): the `Origin-Trial` response header as an equivalent enrollment path.
