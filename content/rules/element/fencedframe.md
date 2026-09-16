---
ruleId: "element/fencedframe"
title: "fencedframe element"
description: "`fencedframe` is Chrome's removed Sandbox embed for cross-site content. Google stubs it in M154 and removes it in M155. Use `iframe`."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'fencedframe'
fix: { op: "none" }
replacement: "Use `iframe`. Fenced frames were never a replacement for iframes — embedded content that does not need cross-site data isolation belongs in an `iframe`."
tags: ["legacy"]
impacts: ["interop", "maintainability"]
related: []
---

`fencedframe` was the Privacy Sandbox embed element: a frame for
cross-site content, typically ads, that could read partitioned data
without sharing it with the embedding page. Unlike an `iframe`, it
blocked DOM access in both directions and was navigated by an opaque
`FencedFrameConfig` from ad APIs rather than by a readable URL.

It shipped only in Chrome, never became a standard — Mozilla holds a
negative standards position — and Google is winding down the Sandbox ad
stack it depended on. The approved removal plan stubs the element in M154
and removes it fully in M155, resolving it to `HTMLUnknownElement`.

## Why avoid

Single-vendor experiment, opposed elsewhere. Fenced frames shipped only
in Chrome (115+); Mozilla's standards position is negative, and the
removal thread records no signals from any other engine — there is no
interop story and never was.

Google is removing it on a fixed schedule. The approved "Intent to Ship:
Remove FencedFrame element and window.fence APIs" stubs the element in
M154 (with a DevTools removal warning) and removes it fully in M155
Stable, resolving it to `HTMLUnknownElement`.

It is already dead weight. Its navigation APIs (Protected Audience,
selectURL) were removed in M152, so a `<fencedframe>` can no longer be
navigated to a document — a small share of page loads still instantiate
the element while internal metrics confirm zero successful navigations.

The transition has sharp edges worth exiting early. The stub keeps
300×150 sizing while full removal collapses to 0×0 unless sized in CSS,
and interface stubs keep existing during M154 — feature detection
(`window.HTMLFencedFrameElement`) cannot be trusted through the
transition.

## Use instead

Embed with `iframe`, which fenced frames were explicitly never meant to
replace:

```html
<iframe src="https://ads.example/creative.html" width="300" height="250" title="Advertisement" loading="lazy"></iframe>
```

## Detectability

Fully detectable. The selector is the bare element name `fencedframe`,
with no logic module — every instance is the Sandbox embed element. No
other HTML or SVG element shares the name, so the selector cannot
false-positive.

There is no autofix. The frame is navigated by an opaque
`FencedFrameConfig` from ad APIs, not by markup, so removing the element
would delete the slot while saying nothing about what replaces the
integration; migrating to `iframe`-based flows is a manual edit.

## Resources

- [Privacy Sandbox — Fenced frames overview](https://privacysandbox.google.com/private-advertising/fenced-frame) — marks the feature "Scheduled for phaseout" and links the removal intent for the element and `window.fence` APIs.
- [blink-dev — Intent to Ship: Remove FencedFrame element and window.fence APIs](https://groups.google.com/a/chromium.org/g/blink-dev/c/c9w5uH3eSuo/) — approved removal plan (stub M154 with DevTools warning, full removal M155 resolving to `HTMLUnknownElement`), usage at ~0.07% of page loads with zero successful navigations.
- [MDN — Fenced Frame API](https://developer.mozilla.org/en-US/docs/Web/API/Fenced_frame_API) — Deprecated/To-be-removed banner: Chrome is withdrawing the `<fencedframe>` element and related APIs; records Mozilla's negative standards position.
- [Privacy Sandbox — Update on Plans for Privacy Sandbox Technologies](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies) — the October 2025 wind-down announcement retiring the Sandbox ad stack fenced frames depended on.
