---
ruleId: "meta/csp-referrer"
title: "<meta http-equiv=\"Content-Security-Policy\"> referrer"
description: "The CSP referrer directive moved out of CSP into Referrer Policy, and Chrome removed it in 56; use <meta name=\"referrer\"> instead."
pubDate: "2026-09-23"
status: "avoid"
severity: "harmful"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="content-security-policy" i]'
match: "logic"
fix: { op: "none" }
replacement: "Delete the directive and set the policy with <meta name=\"referrer\" content=\"strict-origin-when-cross-origin\"> or the Referrer-Policy header."
tags: ["csp", "http-equiv"]
impacts: ["security", "maintainability"]
related: ["meta/referrer-value", "meta/csp-reflected-xss", "meta/http-equiv-content-security-policy"]
---

The `referrer` directive set a page's referrer policy from inside its Content Security Policy. CSP 1.1 drafts defined it; the feature then moved into its own specification, Referrer Policy, with its own header and `<meta name="referrer">`. Inside a policy the directive now sets nothing, so the referrer policy the author wrote there never applies.

## Why avoid

The directive moved out. The W3C Working Draft of CSP 1.1 from 11 February 2014 defined `referrer` as "a referrer policy that the user agent applies" to requests from the page. In October 2015 the CSP editor, Mike West, proposed dropping it: CSP "is simpler to conceptualize as a purely restrictive mechanism", so the policy should become "a distinct header". The feature left CSP for its own specification: Referrer Policy delivers the same policy through the `Referrer-Policy` header, a `<meta name="referrer">` element or a `referrerpolicy` attribute. The current CSP Level 3 Editor's Draft parses any directive name into the policy and gives behaviour only to the directives it defines; `referrer` is not among them.

The engines followed. Chrome supported the directive from Chrome 33 and removed it in Chrome 56; its status entry says it "has been removed from the spec and replaced with the Referrer-Policy header". Gecko's directive list does not contain the name, so Firefox logs "Couldn’t process unknown directive" and drops it. WebKit's directive list does not contain it either.

This directive has a visible cost. A page that relies on `referrer no-referrer` inside its policy gets the default policy, `strict-origin-when-cross-origin`, instead: its origin goes to every other site it requests from, and its full URLs go to its own origin. The severity is `harmful` because the page sends the default policy where the author wrote no-referrer.

## Use instead

Set the referrer policy where Referrer Policy defines it:

```html
<meta name="referrer" content="strict-origin-when-cross-origin">
```

Or as a response header:

```http
Referrer-Policy: strict-origin-when-cross-origin
```

## Detectability

Detectable with a selector plus logic. The selector pre-filters meta CSP; the logic in `packages/rules/logic/meta/csp-referrer.ts` reports the element when one `;` part of `content` names `referrer`, with ASCII case folded. A URL path that holds the string never trips it: `hasDirective` in `packages/rules/lib/csp.ts` reads the first token of each part, never a value. The CLI, the bookmarklet and the ESLint plugin all report. A page with a meta policy also trips `meta/http-equiv-content-security-policy`, which covers what a meta policy cannot do; this rule covers what the policy says.

There is no autofix. The repair edits one `;` part inside `content` and adds a `<meta name="referrer">`, and a fix only removes. Deleting the tag would drop live directives such as `default-src` next to the dead one.

## Resources

- [W3C: CSP 1.1, Working Draft 11 February 2014 §3.2.5.13](https://www.w3.org/TR/2014/WD-CSP11-20140211/#referrer): the draft that defined the directive.
- [public-webappsec, 2015-10: Move `referrer` from CSP to some other header](https://lists.w3.org/Archives/Public/public-webappsec/2015Oct/0043.html): Mike West, 2015-10-09, proposing the move to a distinct header.
- [W3C: Referrer Policy §4 Delivery](https://w3c.github.io/webappsec-referrer-policy/#referrer-policy-delivery): the header, the `<meta name="referrer">` element and the `referrerpolicy` attribute.
- [Chrome Platform Status: CSP 'referrer' directive](https://chromestatus.com/feature/5680800376815616): added in Chrome 33, removed in Chrome 56, "replaced with the Referrer-Policy header".
- [W3C: Referrer Policy, default referrer policy](https://w3c.github.io/webappsec-referrer-policy/#default-referrer-policy): "The default referrer policy is \"strict-origin-when-cross-origin\"."
- [Firefox: `nsCSPUtils.h`](https://github.com/mozilla-firefox/firefox/blob/main/dom/security/nsCSPUtils.h): Gecko's directive list, without `referrer`.
- [Firefox: `csp.properties`](https://github.com/mozilla-firefox/firefox/blob/main/dom/locales/en-US/chrome/security/csp.properties): `couldNotProcessUnknownDirective`, "Couldn’t process unknown directive", the warning for a name outside the directive list.
- [WebKit: `ContentSecurityPolicyDirectiveNames.cpp`](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/csp/ContentSecurityPolicyDirectiveNames.cpp): WebKit's directive names, without `referrer`.
- [CSP Level 3 (Editor's Draft) §2.2.1](https://w3c.github.io/webappsec-csp/#parse-serialized-policy): the parse algorithm, and a directive list without `referrer`.
