---
ruleId: "link/rel-prerender"
title: "link rel=\"prerender\""
description: "A Chrome-specific hint asking for the next page to be rendered ahead of navigation; Chrome cut it to a fetch with no render, and Speculation Rules replace it."
pubDate: "2026-09-16"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="prerender" i]'
fix: { op: "remove-element" }
replacement: "Prerender with a Speculation Rules rule instead of the link hint."
tags: ["head", "link", "legacy", "performance"]
impacts: ["interop", "performance"]
related: []
---

`<link rel="prerender">` is dead: Chrome cut it to a fetch with no render. Speculation Rules replace it for prerender work.

## Why avoid

Chrome shipped the hint, then mapped it to NoState Prefetch: a fetch with no render and no script run.

No spec defines the keyword. MDN carries no spec section for it and badges it Deprecated plus Non-standard.

Firefox and Safari never read it. Chrome gain comes with interop cost.

Speculation Rules cover the work: a prerender rule with moderate eagerness prerenders the next page.

## Use instead

Declare the next page in a speculation rule set:

```html
<script type="speculationrules">
{
  "prerender": [{
    "where": { "href_matches": "/next" },
    "eagerness": "moderate"
  }]
}
</script>
```

Delete the `link` element.

## Detectability

The rule catches each case. It reports each `link` whose `rel` token set includes `prerender`, and skips all else.

Matching uses `~=` because `rel` is a space-separated token set, the same reasoning as `link/image-src`.

The fix removes the element. Chrome runs no render from the hint, so no rendered output goes with it. A NoState Prefetch fetch stops as well; the speculation rule takes its place.

## Resources

- [MDN: rel="prerender"](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prerender): badges the keyword Deprecated and Non-standard, records no spec definition, and points to the Speculation Rules API as successor.
- [Chrome: prerender pages](https://developer.chrome.com/docs/web-platform/prerender-pages): describes link rel=prerender as a past Chrome hint now mapped to NoState Prefetch, and names Speculation Rules as the path for full prerender.
- [MDN: speculative loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Speculative_loading): tags link rel=prerender as deprecated, notes it never left Chrome with no render in current builds, and recommends Speculation Rules prerender.
