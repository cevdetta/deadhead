---
ruleId: "meta/csp-reflected-xss"
title: "<meta http-equiv=\"Content-Security-Policy\"> reflected-xss"
description: "reflected-xss steered browser XSS filters from a CSP 1.1 draft; CSP dropped it, the filters are gone, and it turns on nothing."
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
replacement: "Delete the directive. No directive replaces it; against reflected XSS, MDN recommends a policy that disables inline script."
tags: ["csp", "http-equiv"]
impacts: ["security", "maintainability"]
related: ["meta/http-equiv-x-security-pragmas", "meta/csp-referrer", "meta/http-equiv-content-security-policy"]
---

`reflected-xss` told the browser whether to run its reflected cross-site scripting filter, the policy form of the `X-XSS-Protection` header. A CSP 1.1 draft defined it, CSP dropped it, and the filters it steered no longer exist. `reflected-xss block` turns on nothing.

## Why avoid

The directive never reached a Recommendation. The W3C Working Draft of CSP 1.1 from 11 February 2014 defined it to "active or disactivate any heuristics used to filter or block reflected cross-site scripting attacks", with the values `allow`, `block` and `filter`. CSP Level 2 did not carry it, and in October 2015 Brian Smith proposed dropping it from CSP3, quoting the editor's view that CSP "is simpler to conceptualize as a purely restrictive mechanism". The current Editor's Draft parses any directive name into the policy and gives behaviour only to the directives it defines; `reflected-xss` is not among them.

The engines ignore it. Gecko's parser knows the name only to refuse it: "Currently we are not supporting that directive, hence we log a warning to the console and ignore the directive including its values." Chromium's CSP parser and WebKit's directive list have no entry for it. The filters themselves are gone: MDN describes `X-XSS-Protection` as a feature that Internet Explorer, Chrome and Safari had, and warns that it "can create XSS vulnerabilities in otherwise safe websites".

The cost is a false promise. A reviewer reads a filter switch that no browser has. The severity is `deprecated` because nothing breaks for users; the gap is in what the policy's author believes it does.

## Use instead

Delete the directive. MDN recommends Content Security Policy in place of XSS filtering, with a policy that disables inline script, sent as a response header:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'
```

## Detectability

Detectable with a selector plus logic. The selector pre-filters meta CSP; the logic in `packages/rules/logic/meta/csp-reflected-xss.ts` reports the element when one `;` part of `content` names `reflected-xss`, with ASCII case folded. A URL path that holds the string never trips it: `directiveNames` in `packages/rules/lib/csp.ts` reads the first token of each part, never a value. The CLI, the bookmarklet and the ESLint plugin all report. A page with a meta policy also trips `meta/http-equiv-content-security-policy`, which covers what a meta policy cannot do; this rule covers what the policy says.

There is no autofix. The repair edits one `;` part inside `content`, which no fix op expresses. Deleting the tag would drop live directives such as `default-src` next to the dead one.

## Resources

- [W3C: CSP 1.1, Working Draft 11 February 2014 §3.2.5.14](https://www.w3.org/TR/2014/WD-CSP11-20140211/#reflected-xss): the draft that defined the directive and its `allow`, `block` and `filter` values.
- [W3C: CSP Level 2](https://www.w3.org/TR/CSP2/): the Recommendation, with no `reflected-xss` directive.
- [public-webappsec, 2015-10: Removal of reflected-xss from CSP3](https://lists.w3.org/Archives/Public/public-webappsec/2015Oct/0049.html): Brian Smith, 2015-10-09, proposing the removal and quoting the editor.
- [CSP Level 3 (Editor's Draft) §2.2.1](https://w3c.github.io/webappsec-csp/#parse-serialized-policy): the parse algorithm, and a directive list without `reflected-xss`.
- [Chromium: `content_security_policy.cc`](https://github.com/chromium/chromium/blob/main/services/network/public/cpp/content_security_policy/content_security_policy.cc): Blink's directive names, without `reflected-xss`.
- [Firefox: `nsCSPParser.cpp`](https://github.com/mozilla-firefox/firefox/blob/main/dom/security/nsCSPParser.cpp): Gecko logs a warning and ignores the directive with its values.
- [MDN: X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-XSS-Protection): the filter was a feature of Internet Explorer, Chrome and Safari; it can create XSS vulnerabilities; use CSP instead.
