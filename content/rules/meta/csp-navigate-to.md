---
ruleId: "meta/csp-navigate-to"
title: "<meta http-equiv=\"Content-Security-Policy\"> navigate-to"
description: "navigate-to sat in a CSP3 draft that no browser shipped and was removed in 2022; it restricts no navigation in any engine."
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
replacement: "Delete the directive. No directive replaces it."
tags: ["csp", "http-equiv"]
impacts: ["security", "maintainability"]
related: ["meta/csp-prefetch-src", "meta/csp-reflected-xss", "meta/http-equiv-content-security-policy"]
---

`navigate-to` was meant to restrict "the URLs to which a document can initiate navigations by any means": links, forms, `window.location`, `window.open`. It sat in a CSP Level 3 draft, no browser shipped it, and the draft dropped it in 2022. A policy that lists it reads as if it fenced in navigation, and it fences in nothing.

## Why avoid

The directive never left the drafts. The W3C Working Draft of CSP Level 3 from 15 October 2018 defined `navigate-to`, and w3c/webappsec-csp#564 removed it in September 2022: "it's not something that any vendor has shipped, and there are real concerns about information leaks that it enables." The current Editor's Draft parses any directive name into the policy and gives behaviour only to the directives it defines; `navigate-to` is not among them.

The engines agree. Chromium's CSP parser has no entry for the name and logs "Unrecognized Content-Security-Policy directive", Gecko's directive list lacks it, and so does WebKit's.

The cost is a false promise: a reviewer reads a navigation fence that no browser builds. The severity is `deprecated` because nothing breaks for users; the gap is in what the policy's author believes it does.

## Use instead

Delete the directive. No directive replaces it, and no engine shipped it, so deleting it changes nothing a browser does.

## Detectability

Detectable with a selector plus logic. The selector pre-filters meta CSP; the logic in `packages/rules/logic/meta/csp-navigate-to.ts` reports the element when one `;` part of `content` names `navigate-to`, with ASCII case folded. A URL path that holds the string never trips it: `directiveNames` in `packages/rules/lib/csp.ts` reads the first token of each part, never a value. The CLI, the bookmarklet and the ESLint plugin all report. A page with a meta policy also trips `meta/http-equiv-content-security-policy`, which covers what a meta policy cannot do; this rule covers what the policy says.

There is no autofix. The repair edits one `;` part inside `content`, which no fix op expresses. Deleting the tag would drop live directives such as `default-src` next to the dead one.

## Resources

- [w3c/webappsec-csp#564: Remove `navigate-to`](https://github.com/w3c/webappsec-csp/pull/564): merged 2022-09-16; no vendor shipped it, and it enabled information leaks.
- [W3C: CSP Level 3, Working Draft 15 October 2018](https://www.w3.org/TR/2018/WD-CSP3-20181015/#directive-navigate-to): the draft that defined the directive over navigations "by any means".
- [CSP Level 3 (Editor's Draft) §2.2.1](https://w3c.github.io/webappsec-csp/#parse-serialized-policy): the parse algorithm, and a directive list without `navigate-to`.
- [Chromium: `content_security_policy.cc`](https://github.com/chromium/chromium/blob/main/services/network/public/cpp/content_security_policy/content_security_policy.cc): Blink's directive names, without `navigate-to`.
- [Firefox: `nsCSPUtils.h`](https://github.com/mozilla-firefox/firefox/blob/main/dom/security/nsCSPUtils.h): Gecko's directive list, without `navigate-to`.
- [WebKit: `ContentSecurityPolicyDirectiveNames.cpp`](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/csp/ContentSecurityPolicyDirectiveNames.cpp): WebKit's directive names, without `navigate-to`.
