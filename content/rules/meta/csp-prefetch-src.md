---
ruleId: "meta/csp-prefetch-src"
title: "<meta http-equiv=\"Content-Security-Policy\"> prefetch-src"
description: "prefetch-src left the CSP draft; Chrome and Firefox ignore it and Safari 16.3+ still enforces it, so one policy acts two ways."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="content-security-policy" i]'
match: "logic"
fix: { op: "none" }
replacement: "Delete the directive once default-src allows the prefetches the page needs. It has no successor: the CSP3 draft governs prefetch requests with default-src."
tags: ["csp", "http-equiv"]
impacts: ["security", "maintainability"]
related: ["meta/csp-plugin-types", "meta/csp-navigate-to", "meta/http-equiv-content-security-policy"]
---

`prefetch-src` restricted "the URLs from which resources may be prefetched or prerendered". A CSP3 draft defined it, and the current Editor's Draft does not. Chrome and Firefox skip it, while Safari 16.3 and later enforce it, so a policy that lists it restricts prefetching in one engine only.

## Why avoid

The directive left the spec. The W3C Working Draft of CSP Level 3 from 15 October 2018 defined `prefetch-src`; the current Editor's Draft parses any directive name into the policy and gives behaviour only to the directives it defines, and `prefetch-src` is not among them. Its algorithm for a request's effective directive now returns `default-src` for any request whose initiator is "prefetch" or "prerender".

The engines split. MDN's compatibility data marks `prefetch-src` deprecated and non-standard, supported in Safari 16.3 and in neither Chrome nor Firefox. The sources agree: Chromium's CSP parser has no entry for the name and logs "Unrecognized Content-Security-Policy directive", Gecko's directive list lacks it, and WebKit's `ContentSecurityPolicyDirectiveList.cpp` still parses it and checks prefetch requests against it.

The result is one policy with two meanings. In Safari the directive governs prefetches; in Chrome and Firefox it does nothing. Nothing breaks for users, which is why the severity is `deprecated` rather than `harmful`, but the policy text no longer tells a reader what each engine enforces.

## Use instead

Govern prefetches with `default-src`, which the CSP3 draft already applies to them, and drop the directive:

```http
Content-Security-Policy: default-src 'self' https://cdn.example.com
```

Safari is the one engine that still reads `prefetch-src`, so deleting it changes Safari's policy alone: prefetches there fall back to `default-src`. Check that `default-src` allows the origins the page prefetches from before deleting it.

## Detectability

Detectable with a selector plus logic. The selector pre-filters meta CSP; the logic in `packages/rules/logic/meta/csp-prefetch-src.ts` reports the element when one `;` part of `content` names `prefetch-src`, with ASCII case folded. A URL path that holds the string never trips it: `directiveNames` in `packages/rules/lib/csp.ts` reads the first token of each part, never a value. The CLI, the bookmarklet and the ESLint plugin all report. A page with a meta policy also trips `meta/http-equiv-content-security-policy`, which covers what a meta policy cannot do; this rule covers what the policy says.

There is no autofix. The repair edits one `;` part inside `content`, which no fix op expresses, and Safari still enforces the directive, so deleting it changes Safari's policy.

## Resources

- [CSP Level 3 (Editor's Draft) §2.2.1](https://w3c.github.io/webappsec-csp/#parse-serialized-policy): the parse algorithm, and a directive list without `prefetch-src`.
- [CSP Level 3 (Editor's Draft): Get the effective directive for request](https://w3c.github.io/webappsec-csp/#effective-directive-for-a-request): a request whose initiator is "prefetch" or "prerender" falls under `default-src`.
- [W3C: CSP Level 3, Working Draft 15 October 2018](https://www.w3.org/TR/2018/WD-CSP3-20181015/#directive-prefetch-src): the draft that defined the directive, which "restricts the URLs from which resources may be prefetched or prerendered".
- [MDN browser-compat-data: Content-Security-Policy](https://github.com/mdn/browser-compat-data/blob/main/http/headers/Content-Security-Policy.json): `prefetch-src` marked deprecated and non-standard, supported in Safari 16.3, not in Chrome or Firefox.
- [WebKit: `ContentSecurityPolicyDirectiveList.cpp`](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/csp/ContentSecurityPolicyDirectiveList.cpp): WebKit parses `prefetch-src` and checks prefetch requests against it.
- [Firefox: `nsCSPUtils.h`](https://github.com/mozilla-firefox/firefox/blob/main/dom/security/nsCSPUtils.h): Gecko's directive list, without `prefetch-src`.
- [Chromium: `content_security_policy.cc`](https://github.com/chromium/chromium/blob/main/services/network/public/cpp/content_security_policy/content_security_policy.cc): Blink's directive names, without `prefetch-src`; an unknown name logs "Unrecognized Content-Security-Policy directive".
