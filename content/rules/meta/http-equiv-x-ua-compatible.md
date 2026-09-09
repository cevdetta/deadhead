---
ruleId: "meta/http-equiv-x-ua-compatible"
title: "meta http-equiv=X-UA-Compatible"
description: "X-UA-Compatible only ever controlled Internet Explorer document modes, and no shipping browser reads it."
pubDate: "2026-09-09"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="X-UA-Compatible" i]'
fix: { op: "remove-element" }
replacement: "Delete it. Internet Explorer and legacy Edge modes no longer exist."
tags: ["head", "meta", "legacy", "ie"]
impacts: ["maintainability"]
related: ["script/type-javascript-mime"]
---

`X-UA-Compatible` was a Microsoft pragma, never a web standard. Internet Explorer 8
shipped with several *document modes* — emulations of the layout and scripting quirks of
IE 5, 7 and 8 — and picked one per page using heuristics, a compatibility list shipped by
Microsoft, and this pragma. `IE=edge` was the escape hatch: it told IE to stop guessing
and use its newest engine. Every HTML boilerplate of the era copied it, and it has been
copied forward ever since.

## Why avoid

The pragma has had no reader since 2022. Internet Explorer 11 reached end of support on
15 June 2022 and its desktop application was permanently disabled; legacy (EdgeHTML)
Edge went out of support on 9 March 2021. Chromium-based Edge has one engine and no
document modes, so there is nothing for `IE=edge` to select.

It is also not inert in review. Because it looks like configuration, it invites cargo
cult edits — `IE=edge,chrome=1` is still copied around, and the `chrome=1` half asked for
Google Chrome Frame, a plugin discontinued in 2014. A line nobody can explain but nobody
dares delete costs more over a decade than the bytes it occupies.

## Use instead

Delete it.

```html
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
```

If you are serving the pragma as an HTTP response header rather than a `<meta>` tag,
delete that too — the same reasoning applies, and a header costs every response.

## Detectability

Fully detectable. The pragma is a single element identified by one attribute value, with
no context that changes the verdict, so a selector match is the whole rule and the fix is
always to remove the element.

## Resources

- [HTML Standard — pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-http-equiv) — the normative list of `http-equiv` values; `X-UA-Compatible` is not among them.
- [Internet Explorer 11 end of support](https://learn.microsoft.com/en-us/lifecycle/announcements/internet-explorer-11-end-of-support) — Microsoft, retired 15 June 2022.
- [Specifying legacy document modes](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/jj676915(v=vs.85)) — Microsoft's own documentation for what the pragma did.
