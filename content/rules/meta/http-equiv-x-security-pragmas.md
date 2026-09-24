---
ruleId: "meta/http-equiv-x-security-pragmas"
title: "<meta http-equiv> X-security pragmas"
description: "x-xss-protection, x-webkit-csp, and x-content-security-policy name defenses that no longer exist even as headers; delete the tags and use a CSP response header."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "browser-convention"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv]'
match: "logic"
fix: { op: "remove-element" }
replacement: "Delete the tag. If policy is wanted, send a Content-Security-Policy response header."
tags: ["csp", "http-equiv"]
impacts: ["security"]
related: ["meta/http-equiv-header-only-pragmas"]
---

Three http-equiv values name security mechanisms that no longer exist even
as headers. The reflected-XSS auditor is gone, and the prefixed CSP headers
went with it.

## Why avoid

The auditor is gone and the prefixed headers are retired. MDN marks
X-XSS-Protection deprecated and non-standard, notes its filtering created
XSS holes in otherwise safe sites, and recommends CSP instead. Chrome's
CSP documentation says to ignore the prefixed headers outright: modern
browsers support the unprefixed `Content-Security-Policy` header. Unlike
the header-only family, there is no live header spelling to move these
to. Deletion plus a real CSP header is the whole migration.

## Use instead

```http
Content-Security-Policy: default-src 'self'
```

## Detectability

The rule pre-filters with `meta[http-equiv]`: the verdict depends
on whether the trimmed value, compared ASCII case-insensitively, is one of
the three prefixed security keywords. The decision therefore lives in
`packages/rules/logic/meta/http-equiv-x-security-pragmas.ts`. The fix removes
the element: nothing reads these values, and there is no header to move
them to.

## Resources

- [MDN: X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-XSS-Protection): deprecated, non-standard response header; the auditor is unnecessary with CSP and its filtering created vulnerabilities.
- [Chrome: Content Security Policy](https://developer.chrome.com/docs/privacy-security/csp): ignore the X-WebKit-CSP / X-Content-Security-Policy prefixed headers; use the unprefixed Content-Security-Policy header.
