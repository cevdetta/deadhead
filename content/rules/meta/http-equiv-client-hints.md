---
ruleId: "meta/http-equiv-client-hints"
title: "meta http-equiv client-hint keywords"
description: "http-equiv accept-ch and delegate-ch work only in Chromium for page requests and never persist. Send headers instead."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "browser-convention"
detectability: "yes"
kind: "element"
scope: "head"
selector: "meta[http-equiv]"
match: "logic"
fix: { op: "none" }
replacement: "Persist the opt-in in the Accept-CH/Delegate-CH response headers, which apply pre-parse and stick across navigations; then delete the tag."
tags: ["head", "meta"]
impacts: ["performance", "interop"]
related: ["meta/http-equiv-name-misuse", "meta/http-equiv-content-type"]
---

Client Hints let a server ask the browser for device and network facts —
viewport width, device memory, platform version — so it can adapt responses.
The mechanism is headers-first: the server advertises with `Accept-CH`, the
browser caches the opt-in, and hints ride on subsequent requests. The same two
keywords also exist as `<meta http-equiv>` tags, where they work only in
Chromium, only for page-initiated requests, and never persist. A quarter-million
sites carry the meta form, ~97% of them one CMS's boilerplate.

## Why avoid

It is Chromium-only. WHATWG defines no such pragma, so every other engine
ignores both tags. An opt-in that only opts into one engine is a single-vendor
dependency wearing standard syntax.

It misses the requests that matter. The meta form covers page-initiated
requests only — never subsequent navigations — while the header persists in the
Accept-CH cache, and `Critical-CH` can even restart the first load to include
critical hints. Markup arrives after the parser needed the decision.

`delegate-ch` in markup is order-fragile. Per the WICG algorithm it no-ops if
any `link`, `style` or `script` has begun to execute, requires a secure
top-level context, and never touches the cache. One blocking script above it
silently voids the delegation.

It is monoculture boilerplate. The crawl finds `accept-ch` on ~242,000 sites
and `delegate-ch` on under 500 — the former almost entirely Squarespace
templates. Not a decision per site but a default nobody chose, copied because
nothing visibly breaks.

## Use instead

Persist the opt-in in the response headers, which apply pre-parse and stick
across navigations:

```http
Accept-CH: Sec-CH-UA-Platform-Version, DPR
Vary: Sec-CH-UA-Platform-Version, DPR
```

```http
Delegate-CH: Sec-CH-UA-Platform-Version=(self "https://cdn.example.com")
```

Move the opt-in to the headers first and only then delete the tag: the meta
form functions in Chromium, so deletion alone drops hints the server relies on.

## Detectability

Fully detectable: `meta[http-equiv]` pre-filters and the logic matches the
value, ASCII case-insensitively, against `accept-ch` and `delegate-ch`. Two
values would fit a comma-list selector, but the rule sits in the
`meta[http-equiv]` + logic family with `header-only`, `cache`, `ie` and
`legacy-security`, which keeps every Chromium-extension keyword decision in
code, in one place. The decision lives in
`packages/rules/logic/meta/http-equiv-client-hints.ts`.

There is no autofix. The repair is a response header, which no text edit can
send — and unlike an unread tag, the element does something in Chromium, so
deleting it drops working hints.

## Resources

- [WICG — Client Hints Infrastructure, `Delegate-CH`](https://wicg.github.io/client-hints-infrastructure/#delegate-ch-algo) — the only specced meta form, and hedged: no-ops after any script/link/style, secure top-level only, never touches the Accept-CH cache.
- [WICG — Client Hints Infrastructure, `Accept-CH` cache](https://wicg.github.io/client-hints-infrastructure/#accept-ch-cache-definition) — persistence, eviction and restart semantics exist only for the header; the infra defines no meta equivalent for `accept-ch`.
- [Chrome — User-Agent Client Hints](https://developer.chrome.com/docs/privacy-security/user-agent-client-hints) — documents the meta form and its limit in the same breath: hints requested by meta go out on page-initiated requests only, not subsequent navigations.
- [MDN — `Accept-CH` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept-CH) — header-first design: persist it for all secure requests so hints are sent reliably.
- [You probably don't need http-equiv meta tags](https://rviscomi.dev/2023/07/you-probably-dont-need-http-equiv-meta-tags/) — `accept-ch` at 242,017 sites (~97% Squarespace), `delegate-ch` at 492; non-standard per the HTML spec, supported by Chromium alone.
