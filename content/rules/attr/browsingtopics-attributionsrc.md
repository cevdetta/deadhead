---
ruleId: "attr/browsingtopics-attributionsrc"
title: "<browsingtopics> and <attributionsrc> attributes"
description: "browsingtopics and attributionsrc feed APIs Chrome is removing; once they go, the attributes do nothing."
pubDate: "2026-09-25"
status: "avoid"
severity: "deprecated"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "any"
selector: "iframe[browsingtopics], img[browsingtopics], a[attributionsrc], area[attributionsrc], img[attributionsrc], script[attributionsrc]"
fix: { op: "none" }
replacement: "Delete the attribute: <img src=\"/banner.png\" alt=\"Autumn sale\">."
tags: ["embedding"]
impacts: ["maintainability"]
related: ["attr/iframe-allow-privacy-sandbox"]
---

Two attributes opt requests into Privacy Sandbox measurement. `browsingtopics`
on `iframe` and `img` sends the selected topics with the request for the
source. `attributionsrc` on `a`, `area`, `img` and `script` marks the request
eligible for attribution. Google retired the Topics API and the Attribution
Reporting API, and Chrome 153 deprecates both, so each attribute feeds an API
Chrome is removing.

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

Once the removal lands, the attributes change nothing: no topics travel with
the request, and no attribution source registers from it.

## Use instead

Delete the attribute and keep the element:

```html
<img src="/banner.png" alt="Autumn sale">
```

Neither API has a successor in Chrome, which keeps third-party cookies.

## Detectability

Detectable with the selector alone. The comma lists every spelling:
`browsingtopics` on `iframe` and `img`; `attributionsrc` on `a`, `area`, `img`
and `script`. Anything unlisted stays quiet by construction. The CLI, the
bookmarklet and the ESLint plugin all report; none skips.

There is no autofix. The attributes still act in Chrome until the removal
ships, so deleting one today would drop live measurement; after that, one op
takes one attribute name while the rule covers two, which keeps `none` the
honest fix.

## Resources

- [Privacy Sandbox: Update on Plans for Privacy Sandbox Technologies (2025-10-17)](https://privacysandbox.com/news/update-on-plans-for-privacy-sandbox-technologies/): Google retires the Topics API and the Attribution Reporting API in Chrome and Android; phase-out follows Chrome and Android processes.
- [patcg-individual-drafts/topics (archived 2025-11-12)](https://github.com/patcg-individual-drafts/topics): banner states the Topics API is deprecated and planned for removal from Chrome; documents `browsingtopics` on `iframe` and `img` sending topics with the request.
- [ChromeStatus: Deprecate and remove Topics API](https://chromestatus.com/feature/5135370673061888): removal note reads deprecate in M144 and remove in M153, with deprecation milestones at desktop and Android 153.
- [ChromeStatus: Deprecate and remove Attribution Reporting API](https://chromestatus.com/feature/6320639375966208): deprecation milestones at desktop and Android 153.
- [Chrome 153 release notes](https://developer.chrome.com/release-notes/153): Stable release date September 8th, 2026, with a Deprecate and remove Attribution Reporting API section.
- [WICG: Attribution Reporting §2.1](https://wicg.github.io/attribution-reporting-api/#html-monkeypatches): `attributionsrc` content attributes on `a`, `area`, `img` and `script` mark requests eligible for attribution.
- [Mozilla Standards Positions #622](https://github.com/mozilla/standards-positions/issues/622): Mozilla holds a negative position on the Topics API.
