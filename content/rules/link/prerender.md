---
ruleId: "link/prerender"
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
fix: { op: "none" }
replacement: "Add a Speculation Rules prerender rule for the next page first, then delete the prerender token."
tags: ["resource-hints"]
impacts: ["interop", "performance"]
related: []
---

`<link rel="prerender">` still triggers a fetch. Chrome maps it to NoState Prefetch: no render, but a real background fetch of the target page and its subresources, current as of its January 2026 documentation. Speculation Rules replace it for prerender work.

## Why avoid

Chrome shipped the hint, then mapped it to NoState Prefetch: a fetch with no render and no script run.

No spec defines the keyword. MDN carries no spec section for it and badges it Deprecated plus Non-standard.

Firefox and Safari never read it. Chrome gain comes with interop cost.

Speculation Rules cover the work: a prerender rule with moderate eagerness prerenders the next page.

## Use instead

Declare the next page in a speculation rule set first, then delete the `prerender` token by hand. There is no autofix, and deleting the token before adding the rule stops the current fetch with nothing prefetching in its place:

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

## Detectability

The rule catches each case. It reports each `link` whose `rel` token set includes `prerender`, and skips all else.

Matching uses `~=` because `rel` is a space-separated token set, the same reasoning as `link/image-src`.

There is no autofix. Chrome still runs a NoState Prefetch fetch from the token as of its current (January 2026) documentation, with no removal milestone announced; deleting the token with no equivalent Speculation Rules entry stops that fetch with nothing prefetching in its place.

## Resources

- [MDN: rel="prerender"](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/prerender): badges the keyword Deprecated and Non-standard, records no spec definition, and points to the Speculation Rules API as successor.
- [Chrome: prerender pages](https://developer.chrome.com/docs/web-platform/prerender-pages): says the link syntax "remains in place" for NoState Prefetch, a real background fetch, and names Speculation Rules as the path for full prerender.
- [MDN: speculative loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Speculative_loading): tags link rel=prerender as deprecated, notes it never left Chrome with no render in current builds, and recommends Speculation Rules prerender.
