---
ruleId: "meta/csp-plugin-types"
title: "<meta http-equiv=\"Content-Security-Policy\"> plugin-types"
description: "plugin-types left CSP after Level 2 and no engine enforces it, so it restricts no plugin. object-src 'none' blocks plugin content."
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
replacement: "Delete the directive and add object-src 'none', which blocks <object> and <embed> loads."
tags: ["csp", "http-equiv"]
impacts: ["security", "maintainability"]
related: ["meta/csp-prefetch-src", "meta/http-equiv-content-security-policy", "element/object-embed-plugin"]
---

`plugin-types` listed the media types a page's `<object>` and `<embed>` elements could load as plugins. CSP Level 2 defined it, CSP Level 3 does not, and every engine now ignores it. A policy that lists it reads as stronger than the one the browser applies.

## Why avoid

The directive went with the plugins. Chrome 90 removed it in 2021: "Since Flash support has been discontinued, there is no longer any need for this policy directive." Chromium's CSP parser now answers the name with a console message: "The Content-Security-Policy directive 'plugin-types' has been removed from the specification. If you want to block plugins, consider specifying \"object-src 'none'\" instead."

WebKit still parses it and enforces nothing. Its `allowPluginType` returns true under the comment "The 'plugin-types' directive was removed from the CSP specification and is no longer enforced", and WebKit reports a deprecation when a page with the directive uses `<object>` or `<embed>`. Gecko's directive list does not contain the name. The current CSP Level 3 Editor's Draft parses any directive name into the policy and gives behaviour only to the directives it defines; `plugin-types` is not among them.

The cost is a false promise. `plugin-types application/pdf` restricts no plugin in any engine. The severity is `deprecated` because nothing breaks for users; the gap is in what the policy's author believes it does.

## Use instead

`object-src 'none'` blocks what `plugin-types` was for. Sent as a response header, where a policy has its full reach:

```http
Content-Security-Policy: default-src 'self'; object-src 'none'
```

## Detectability

Detectable with a selector plus logic. The selector pre-filters meta CSP; the logic in `packages/rules/logic/meta/csp-plugin-types.ts` reports the element when one `;` part of `content` names `plugin-types`, with ASCII case folded. A URL path that holds the string never trips it: `directiveNames` in `packages/rules/lib/csp.ts` reads the first token of each part, never a value. The CLI, the bookmarklet and the ESLint plugin all report. A page with a meta policy also trips `meta/http-equiv-content-security-policy`, which covers what a meta policy cannot do; this rule covers what the policy says.

There is no autofix. The repair edits one `;` part inside `content`, which no fix op expresses. Deleting the tag would drop live directives such as `default-src` next to the dead one.

## Resources

- [W3C: CSP Level 2 §7.12 plugin-types](https://www.w3.org/TR/CSP2/#directive-plugin-types): the Recommendation that defined the directive.
- [CSP Level 3 (Editor's Draft) §2.2.1](https://w3c.github.io/webappsec-csp/#parse-serialized-policy): the parse algorithm, and a directive list without `plugin-types`.
- [Chrome: Deprecations and removals in Chrome 90](https://developer.chrome.com/blog/deps-rems-90): the removal of `plugin-types`.
- [Chromium: `content_security_policy.cc`](https://github.com/chromium/chromium/blob/main/services/network/public/cpp/content_security_policy/content_security_policy.cc): the console message pointing authors to `object-src 'none'`.
- [WebKit: `ContentSecurityPolicy.cpp`](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/csp/ContentSecurityPolicy.cpp): `allowPluginType` returns true; the directive "is no longer enforced".
- [Firefox: `nsCSPUtils.h`](https://github.com/mozilla-firefox/firefox/blob/main/dom/security/nsCSPUtils.h): Gecko's directive list, without `plugin-types`.
