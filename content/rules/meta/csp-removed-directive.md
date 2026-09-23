---
ruleId: "meta/csp-removed-directive"
title: "CSP directive removed from the spec"
description: "prefetch-src, plugin-types, navigate-to, referrer and reflected-xss left CSP; browsers skip four of them, and Safari alone enforces prefetch-src."
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
replacement: "Delete the directive and use its successor where one exists: object-src 'none' for plugin-types, <meta name=\"referrer\"> or the Referrer-Policy header for referrer. reflected-xss, navigate-to and prefetch-src have none."
tags: ["csp", "http-equiv"]
impacts: ["security", "maintainability"]
related: ["meta/csp-report-uri", "meta/csp-block-all-mixed-content", "meta/http-equiv-content-security-policy"]
---

Content Security Policy grew and shed directives over three levels. Five that once had a
spec, `referrer`, `reflected-xss`, `plugin-types`, `navigate-to` and `prefetch-src`, have
none now. A policy that still lists them reads as stronger than the one the browser
applies.

## Why avoid

The current CSP Level 3 draft parses any directive name into the policy and gives
behaviour to the directives it defines. The five here are not among them, and each left by
its own route:

- `referrer` and `reflected-xss` came from CSP 1.1 in 2012. `referrer` moved out of CSP
  into its own header, which became Referrer Policy. `reflected-xss` was deferred from
  CSP2, and in October 2015 Brian Smith proposed dropping it from CSP3, quoting the
  editor's view that CSP "is simpler to conceptualize as a purely restrictive mechanism".
  The current draft does not define it.
- `plugin-types` came from CSP2. Chrome 90 removed it in 2021: "Since Flash support has
  been discontinued, there is no longer any need for this policy directive."
- `navigate-to` sat in a CSP3 draft until w3c/webappsec-csp#564 removed it in September
  2022: "it's not something that any vendor has shipped, and there are real concerns
  about information leaks that it enables."
- `prefetch-src` is gone from the CSP3 draft. MDN's compatibility data marks it deprecated
  and non-standard, with support in Safari 16.3 and none in Chrome or Firefox.

The cost is a false promise. `plugin-types application/pdf` restricts no plugin, and
`reflected-xss block` turns on no filter. The severity is `deprecated` because nothing
breaks for users; the gap is in what the policy's author believes it does.

## Use instead

Replace what has a successor and delete the rest. Sent as response headers, where a policy
has its full reach:

```http
Content-Security-Policy: default-src 'self'; object-src 'none'
Referrer-Policy: strict-origin-when-cross-origin
```

`object-src 'none'` blocks plugin content, which is what `plugin-types` was for.
`reflected-xss`, `navigate-to` and `prefetch-src` have no successor; Safari is the one
browser that still reads `prefetch-src`, so its removal changes Safari's policy alone.

## Detectability

Detectable with a selector plus logic. The selector pre-filters meta CSP; the logic in
`packages/rules/logic/meta/csp-removed-directive.ts` splits `content` on `;`, takes each
directive's first token, lowercases it, and reports the element when one names a removed
directive. A URL path that holds one of the names never trips it. The CLI, the bookmarklet
and the ESLint plugin all report; none skips.

The finding does not name the directive; the description lists all five. A page with a
meta policy also trips `meta/http-equiv-content-security-policy`, which covers what a meta
policy cannot do; this rule covers what the policy says.

There is no autofix. The repair edits text inside `content`, which no fix op expresses,
and Safari still enforces `prefetch-src`, so deleting it changes Safari's policy.

## Resources

- [CSP Level 3 (Editor's Draft) §2.2.1](https://w3c.github.io/webappsec-csp/#parse-serialized-policy): the parse algorithm, and a directive list that names none of the five.
- [w3c/webappsec-csp#564: Remove `navigate-to`](https://github.com/w3c/webappsec-csp/pull/564): merged 2022-09-16.
- [Chrome: Deprecations and removals in Chrome 90](https://developer.chrome.com/blog/deps-rems-90): the removal of `plugin-types`.
- [public-webappsec, 2015-10: Removal of reflected-xss from CSP3](https://lists.w3.org/Archives/Public/public-webappsec/2015Oct/0049.html): Brian Smith, 2015-10-09, proposing the removal and quoting the editor.
- [MDN browser-compat-data: Content-Security-Policy](https://github.com/mdn/browser-compat-data/blob/main/http/headers/Content-Security-Policy.json): `prefetch-src` marked deprecated and non-standard, supported in Safari 16.3.
