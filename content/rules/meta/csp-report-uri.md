---
ruleId: "meta/csp-report-uri"
title: "CSP report-uri in meta"
description: "report-uri is deprecated in favor of report-to and has no effect in a meta tag; strip the directive and send reporting through response headers."
pubDate: "2026-09-19"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="content-security-policy" i]'
match: "logic"
fix: { op: "none" }
replacement: "Drop the report-uri directive from the meta content. Send reporting with report-to plus Reporting-Endpoints response headers."
tags: ["csp", "http-equiv"]
impacts: ["security", "maintainability"]
related: ["meta/http-equiv-content-security-policy", "meta/http-equiv-header-only", "meta/csp-block-all-mixed-content"]
---

`report-uri` in a meta CSP policy reports nothing. CSP3 labels the directive deprecated in favor of `report-to`, and the meta form ignores it in each browser, so the markup claims coverage it never sends.

## Why avoid

CSP3 retires the directive in one line. The Changes from Level 2 list states `report-uri` is deprecated in favor of the new `report-to` directive, which rides on the Reporting API as infrastructure. The `report-uri` section adds the compat rule: where `report-to` is present, `report-uri` is ignored, which supports a header pair during migration. MDN badges the page Deprecated and repeats the warning: `report-to` is intended to replace `report-uri`, and in browsers that support `report-to`, the `report-uri` directive is ignored.

The meta form drops the directive twice over. MDN states on the same page: this directive is not supported in the `<meta>` element. CSP3 states the same bar in the meta element section: `Report-Only`, `report-uri`, `frame-ancestors`, and `sandbox` are not supported in meta. CSP2 said it first: the `report-uri` directive is ignored where contained within a `meta` element. A meta policy that lists `report-uri` sends zero reports in each browser, while review reads the policy as monitored.

The loss is silent. A header policy that keeps `report-uri` still sends reports from old browsers, and a header pair of `report-uri` plus `report-to` covers both eras. A meta policy has no such path: both reporting directives are inert in meta, so violation data never leaves the client. Authors who trust the meta string miss exploit probes the header pair would have caught.

## Use instead

Keep the enforce policy in markup where a header is not yet an option, minus the dead directive:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

Send violation reporting through headers, where both the old and the new mechanisms live:

```http
Reporting-Endpoints: csp="https://example.com/csp-reports"
Content-Security-Policy: default-src 'self'; report-to csp
```

MDN documents the same pair: `report-to` names an endpoint from the `Reporting-Endpoints` header, and the header example maps a name to a URL. Neither reporting directive gains a meta spelling, so reporting must ride on headers.

## Detectability

Complete detection. The rule pre-filters with `meta[http-equiv="content-security-policy" i]`: the verdict depends on whether one `;` part of `content` names `report-uri` as its directive, compared ASCII case-insensitive. The decision therefore lives in `packages/rules/logic/meta/csp-report-uri.ts`. A `report-to` directive in isolation never trips the rule, and a URL path that holds the string leaves the rule silent: the test reads directive names, not substrings. Sibling `meta/http-equiv-content-security-policy` flags each meta CSP as harmful; this rule names the deprecated directive inside it, so a tag with `report-uri` trips both.

There is no autofix. The fault sits in one `;` part of `content`, which no fix op edits: `remove-token` splits on whitespace and would corrupt the `;` list. Deleting the tag would drop live fetch directives such as `default-src` next to the dead one. Edit the `;` part by hand.

## Resources

- [W3C CSP3: Changes from Level 2](https://www.w3.org/TR/CSP3/#changes-from-level-2): `report-uri` is deprecated in favor of the new `report-to` directive, which relies on Reporting API infrastructure.
- [W3C CSP3: directive-report-uri](https://w3c.github.io/webappsec-csp/#directive-report-uri): `report-to` overrides `report-uri` where both are present, which defines the migration pair.
- [MDN: Content-Security-Policy report-uri](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-uri): badges the directive Deprecated, warns `report-to` replaces it and overrides it in supporting browsers, and states it is not supported in `<meta>`.
- [MDN: Content-Security-Policy report-to](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/report-to): `report-to` names an endpoint from `Reporting-Endpoints`, is intended to replace `report-uri`, and is not supported in `<meta>`.
- [W3C CSP3: the meta element](https://www.w3.org/TR/CSP3/#meta-element): `Report-Only`, `report-uri`, `frame-ancestors`, and `sandbox` are not supported in meta.
