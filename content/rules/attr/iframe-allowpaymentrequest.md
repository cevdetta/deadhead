---
ruleId: "attr/iframe-allowpaymentrequest"
title: "<iframe allowpaymentrequest>"
description: "allowpaymentrequest is removed; write allow=\"payment\" instead, or Chrome grants payment to every origin."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "iframe[allowpaymentrequest]"
fix: { op: "none" }
replacement: "Use allow=\"payment\", which grants the frame's src origin; allow=\"payment *\" reproduces the old grant to every origin."
tags: ["embedding"]
impacts: ["security", "maintainability"]
related: ["attr/iframe-presentational"]
---

`<iframe allowpaymentrequest>` let a framed checkout call the Payment Request API. HTML
removed the attribute in 2020 and moved the permission to the `allow` attribute, where
every other delegated feature lives. Chrome still reads the old spelling, and grants more
with it than the new one does.

## Why avoid

whatwg/html#5915, "Remove allowpaymentrequest attribute", landed on 2020-09-16 with the
implementer record in its description: "Never implemented in WebKit/Safari", "Never
shipped in Firefox", and Chrome in favour of deprecating it. Firefox followed in version
83: bug 1665252, "allowpaymentrequest attribute on iframe is deprecated". The HTML
Standard does not list the attribute among its obsolete features; it is gone.

Chrome kept a compatibility path. Blink's `HTMLIFrameElement` reads the attribute and,
when `allow` sets no `payment` policy, enables payment "for all origins". When `allow`
does set one, Blink logs "Allow attribute will take precedence over
'allowpaymentrequest'", and a use counter measures whether the attribute still changes
anything. The old attribute's grant reaches every origin the frame navigates to, wider
than `allow="payment"`, which covers the frame's `src` origin.

## Use instead

```html
<iframe src="https://pay.example.com/checkout" allow="payment"></iframe>
```

Write `allow="payment *"` where the frame needs the old reach.

## Detectability

Detectable with the selector alone. The CLI, the bookmarklet and the ESLint plugin all
report; none skips.

There is no autofix. Chrome still acts on the attribute, so deleting it withdraws the
payment grant there, and the replacement adds markup, which no fix op writes.

## Resources

- [whatwg/html#5915: Remove allowpaymentrequest attribute](https://github.com/whatwg/html/pull/5915): merged 2020-09-16; "Never implemented in WebKit/Safari", "Never shipped in Firefox".
- [Mozilla bug 1665252](https://bugzilla.mozilla.org/show_bug.cgi?id=1665252): "allowpaymentrequest attribute on iframe is deprecated", fixed in Firefox 83.
- [Chromium: html_iframe_element.cc](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/html_iframe_element.cc): with no `payment` policy in `allow`, the attribute enables payment "for all origins".
