---
ruleId: "attr/iframe-allow-privacy-sandbox"
title: "<iframe allow> Topics and Attribution directives"
description: "Delegating Topics or Attribution Reporting in allow grants nothing once Chrome removes them; delete the directive."
pubDate: "2026-09-25"
status: "avoid"
severity: "deprecated"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "body"
selector: "iframe[allow]"
match: "logic"
fix: { op: "none" }
replacement: "Delete the directive from allow: <iframe src=\"https://ads.example.com/slot\" title=\"Advertisement\"></iframe>."
tags: ["embedding"]
impacts: ["maintainability"]
related: ["attr/browsingtopics-attributionsrc"]
---

Three `allow` directives delegate Privacy Sandbox measurement to a frame:
`browsing-topics`, `interest-cohort` and `attribution-reporting`. Google retired
the Topics API and the Attribution Reporting API, and Chrome 153 deprecates both,
so each directive grants a feature Chrome is removing.

## Why avoid

Google ended both APIs on 2025-10-17: the Privacy Sandbox update retires the
Topics API and the Attribution Reporting API in Chrome and Android and routes
the phase-out through Chrome and Android processes. The Topics spec repo now
carries a deprecation banner and sits archived since 2025-11-12. Chromestatus
tracks the Topics removal with deprecation milestones at desktop and Android
153 (deprecate in 144, remove in 153) and the Attribution removal with the same
153 milestones on both platforms. Chrome 153 reached Stable on 2026-09-08 with
the Attribution removal in its release notes. No other engine ships either API:
Mozilla holds a negative position on Topics, and neither entry shows a Safari
signal.

A directive naming them delegates a feature with no future: the frame gains no
lasting capability, and the markup outlives the API behind it.

## Use instead

Delete the directive and keep the frame:

```html
<iframe src="https://ads.example.com/slot" title="Advertisement"></iframe>
```

Topics and Attribution Reporting have no successor in Chrome; Chrome keeps
third-party cookies, which the retirement intents give as the reason.

## Detectability

Detectable with a selector plus logic. `iframe[allow]` pre-filters; the logic
in `packages/rules/logic/attr/iframe-allow-privacy-sandbox.ts` splits the value
on `;`, takes each part's first token, lowercases it, and reports the element
when the token names `browsing-topics`, `interest-cohort` or
`attribution-reporting`. A URL path holding one of the names never trips the
rule: the test reads directive names, never values. The CLI, the bookmarklet
and the ESLint plugin all report; none skips.

There is no autofix. The fault sits in one `;` part of `allow`, which no fix op
edits: `remove-token` splits on whitespace and would corrupt the `;` list.
Deleting the tag would drop the frame itself.

## Resources

- [Privacy Sandbox: Update on Plans for Privacy Sandbox Technologies (2025-10-17)](https://privacysandbox.com/news/update-on-plans-for-privacy-sandbox-technologies/): Google retires the Topics API and the Attribution Reporting API in Chrome and Android; phase-out follows Chrome and Android processes.
- [patcg-individual-drafts/topics (archived 2025-11-12)](https://github.com/patcg-individual-drafts/topics): banner states the Topics API is deprecated and planned for removal from Chrome; the repo no longer updates.
- [ChromeStatus: Deprecate and remove Topics API](https://chromestatus.com/feature/5135370673061888): removal note reads deprecate in M144 and remove in M153, with deprecation milestones at desktop and Android 153.
- [ChromeStatus: Deprecate and remove Attribution Reporting API](https://chromestatus.com/feature/6320639375966208): deprecation milestones at desktop and Android 153.
- [Chrome 153 release notes](https://developer.chrome.com/release-notes/153): Stable release date September 8th, 2026, with a Deprecate and remove Attribution Reporting API section.
- [MDN: `<iframe>`: `allow`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe): `allow` specifies a Permissions Policy for the frame, built from named directives.
- [blink-dev: Intent to Deprecate and Remove Topics API](https://groups.google.com/a/chromium.org/g/blink-dev/c/_R85yctz4Rs): the vendor intent thread for the Topics removal.
- [blink-dev: Intent to Deprecate and Remove Attribution Reporting API](https://groups.google.com/a/chromium.org/d/msgid/blink-dev/beb44d6a-aae5-4664-994a-38fb93bb4580n%40chromium.org): the vendor intent thread for the Attribution removal.
- [Mozilla Standards Positions #622](https://github.com/mozilla/standards-positions/issues/622): Mozilla holds a negative position on the Topics API.
