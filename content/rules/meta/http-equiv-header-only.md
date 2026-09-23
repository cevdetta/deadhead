---
ruleId: "meta/http-equiv-header-only"
title: "meta http-equiv with header-only values"
description: "X-Frame-Options, HSTS, CSP report-only, nosniff, Permissions-Policy, CORS, and referrer-policy are header-only in browsers; in a meta tag they do nothing."
pubDate: "2026-09-14"
status: "avoid"
severity: "harmful"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv]'
match: "logic"
fix: { op: "remove-element" }
replacement: "Send each value as a real response header: X-Frame-Options as CSP frame-ancestors, the rest under their own header names, referrer via meta name. Then delete the tag."
tags: ["http-equiv"]
impacts: ["security"]
related: ["meta/http-equiv-legacy-security"]
---

A meta tag cannot carry these headers. Some security and CORS headers work only as
HTTP response headers, yet they
keep showing up as `<meta http-equiv>` tags, where they do nothing while
looking like protection. The pragma table has none of these keywords, so
every one of them maps to no state.

## Why avoid

Each one is specified as header-delivered, and several specifications say
the meta form out loud. RFC 7034: X-Frame-Options "must be sent as an HTTP
header field and is explicitly ignored by user agents when declared with a
meta http-equiv tag." RFC 6797: user agents "MUST NOT heed"
http-equiv Strict-Transport-Security. CSP3: the Report-Only header "is not
supported inside a meta element": neither are `report-uri`,
`frame-ancestors`, and `sandbox`, and `frame-ancestors` "MUST be ignored"
in meta policy, so a meta X-Frame-Options cannot even be rescued by a meta
CSP. The rest are response-header mechanisms by construction: nosniff is
consumed by Fetch and MIME-sniffing, Permissions-Policy and ACAO are
documented as response headers (ACAO intrinsically needs server-side Origin
checking), and the in-document referrer mechanism is `<meta
name="referrer">`, not http-equiv.

A page carrying these tags is unprotected while appearing protected: to
its authors, its scanners, and its reviewers. That is the harmful case:
not dead weight, but a false sense of security.

## Use instead

```http
Content-Security-Policy: frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

```html
<meta name="referrer" content="no-referrer">
```

## Detectability

The rule pre-filters with `meta[http-equiv]`: the verdict depends
on whether the trimmed value, compared ASCII case-insensitively, is one of
the seven header-only keywords. The decision therefore lives in
`packages/rules/logic/meta/http-equiv-header-only.ts`. The fix removes the
element: deletion loses nothing, because no browser reads these values in
meta. The replacement tells the author which header to send instead.

## Resources

- [RFC 7034: X-Frame-Options](https://www.rfc-editor.org/rfc/rfc7034.txt): must be sent as an HTTP header; explicitly ignored in a meta tag.
- [RFC 6797 §8.5: HSTS](https://www.rfc-editor.org/rfc/rfc6797#section-8.5): user agents MUST NOT heed http-equiv Strict-Transport-Security.
- [CSP3: The meta element](https://www.w3.org/TR/CSP3/#meta-element): Report-Only, report-uri, frame-ancestors, and sandbox are not supported in meta; frame-ancestors MUST be ignored there.
- [MDN: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options): an HTTP response header consumed by Fetch/MIME-sniffing.
- [MDN: Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy): delivered as an HTTP response header.
- [MDN: Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin): an HTTP response header requiring server-side Origin logic.
- [MDN: `<meta name="referrer">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/referrer): the in-document referrer mechanism is meta name, not http-equiv.
- [MDN: `<meta http-equiv>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/http-equiv): do not set other security headers with meta http-equiv: false sense of security.
