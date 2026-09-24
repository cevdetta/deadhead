---
ruleId: "meta/http-equiv-feature-policy"
title: "meta http-equiv=feature-policy"
description: "Feature-Policy is the retired name of Permissions-Policy; the tag is dead weight, so delete it."
pubDate: "2026-09-19"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="feature-policy" i]'
fix: { op: "remove-element" }
replacement: "Delete the tag. Send Permissions-Policy as a response header and use the allow attribute on iframes for per-frame control."
tags: ["http-equiv"]
impacts: ["maintainability"]
related: ["meta/http-equiv-header-only-pragmas"]
---

`Feature-Policy` was renamed to `Permissions-Policy` on 26 May 2020, with
a new header syntax built on structured fields. A `<meta http-equiv>`
tag carrying the retired name has no reader: the HTML pragma table never
listed either name, so the tag maps to no state and browsers skip it.

## Why avoid

The rename is a matter of record on both sides. The Chrome intro post
carries a note naming 26 May 2020 as the rename date, with an instruction
to migrate headers. MDN repeats the rename in its Permissions Policy
guide, warning past Feature Policy users to check their usage. The W3C
Permissions Policy draft standardises `Permissions-Policy` as the header
field and registers it with IANA.

The meta form was never a delivery channel for either name. The WHATWG
pragma list is a closed set with no entry for policy names, so a policy
tag in meta does nothing. The successor name is inert in meta as well:
deadhead flags `Permissions-Policy` in meta as `header-only` under
`meta/http-equiv-header-only-pragmas`. A page carrying the retired spelling gets
no policy enforcement while its markup claims a control its authors have no reason to trust.

## Use instead

Send the policy as a response header:

```http
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

For per-frame control, use the `allow` attribute:

```html
<iframe src="https://example.com" allow="camera 'none'; microphone 'none'"></iframe>
```

## Detectability

Complete detection. The rule matches `http-equiv="feature-policy"` with the `i` flag: one selector branch is the whole rule, and the fix
always removes the element. Deletion loses nothing, because no browser
acts on the tag in meta form.

## Resources

- [Chrome: note on the Feature Policy intro post](https://developer.chrome.com/blog/feature-policy): names 26 May 2020 as the rename date and tells authors to migrate headers.
- [MDN: Permissions Policy guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy): states the retired name, the new header syntax, and the call to check past Feature Policy use.
- [W3C: Permissions Policy draft](https://www.w3.org/TR/permissions-policy/): standardises the `Permissions-Policy` header field and its IANA registration.
- [MDN: Permissions-Policy header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy): documents delivery as an HTTP response header.
- [WHATWG HTML: pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-http-equiv): defines the closed pragma set, with no entry for either policy name.
