---
ruleId: "meta/http-equiv-content-security-policy"
title: "meta http-equiv=content-security-policy"
description: "A meta policy cannot match a header policy. The spec strips frame-ancestors, report-uri and sandbox, with no report-only mode."
pubDate: "2026-09-14"
status: "avoid"
severity: "harmful"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="content-security-policy" i]'
fix: { op: "none" }
replacement: "Send the policy as the Content-Security-Policy response header, which supports every directive and both dispositions; then delete the tag."
tags: ["head", "meta", "security"]
impacts: ["security", "performance"]
related: ["meta/http-equiv-header-only", "meta/http-equiv-content-type", "meta/http-equiv-content-language"]
---

A meta policy cannot match a header policy. Content Security Policy is delivered two
ways: the `Content-Security-Policy`
response header, and `<meta http-equiv="content-security-policy">`. The two look
equivalent and are not. A meta policy parses with disposition `enforce` and the
spec removes `frame-ancestors`, `report-uri` and `sandbox` from it by algorithm;
there is no report-only dry run. Well over 100,000 sites carry the tag.

## Why avoid

It silently drops `frame-ancestors`. An author who writes it believes
clickjacking is blocked; the browser enforces everything except that. The gap is
invisible: no console error, only a frameable page. That is a security hole the
author believes closed, which is why this rule is `harmful` rather than
`unnecessary`.

`report-uri` and `sandbox` go with it. Violation reporting and sandboxing cannot
be expressed in a meta policy at all, and meta is enforce-or-nothing: there is
no way to trial a policy before it starts blocking.

It costs performance. In Chromium any meta CSP stops the preload scanner, so
subresources start later than they would under a header policy: a security
mechanism that slows the page it under-protects.

It applies late or not at all. Meta policies do not cover content that precedes
them (prefetches, earlier scripts), and a meta CSP outside `<head>` is ignored
entirely. Headers apply to the whole response.

## Use instead

The header, which supports every directive and both dispositions:

```http
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'
```

Report-only testing needs the header too: there is no meta equivalent:

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-reports
```

Send the header first and only then delete the tag: deletion removes
enforcement, including the subset the meta policy does enforce.

## Detectability

Fully detectable. The rule matches with a selector only:
`meta[http-equiv="content-security-policy" i]`. One element, one attribute value;
no context changes the verdict, and the match is case-insensitive because
pragma keywords are ASCII case-insensitive.

There is no autofix. The repair is a server header, which no text edit can send,
the same reason `meta/http-equiv-refresh` carries `fix: none` for a live
redirect. The author sends the header first and then deletes.

## Resources

- [CSP3: Policy delivery: the `<meta>` element](https://www.w3.org/TR/CSP3/#meta-element): meta policies parse with source `meta` and disposition `enforce`; the algorithm removes all `report-uri`, `frame-ancestors` and `sandbox` directives.
- [CSP3: the report-only header](https://www.w3.org/TR/CSP3/#cspro-header): report-only exists only as a header; it is not supported inside `<meta>`.
- [HTML Standard: Content security policy state](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives): meta content must not contain the three directives, and resources fetched before the meta are not guaranteed to be blocked.
- [Chromium issue 1458493](https://crbug.com/1458493): any meta CSP stops the preload scanner; corroborated by the fixing commit and the capo.js validator treating all meta CSPs as invalid.
- [MDN: `Content-Security-Policy` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy): header delivery, both dispositions, and runnable examples: the replacement.
- [You probably don't need http-equiv meta tags](https://rviscomi.dev/2023/07/you-probably-dont-need-http-equiv-meta-tags/): 100,552 sites carry a meta CSP; recommendation is the header.
