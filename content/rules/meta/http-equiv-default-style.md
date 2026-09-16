---
ruleId: "meta/http-equiv-default-style"
title: "meta http-equiv=default-style"
description: "default-style names the preferred alternate stylesheet by its title: a switching mechanism no browser UI exposes anymore."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="default-style" i]'
fix: { op: "none" }
replacement: "Style variants with modern CSS media features such as prefers-color-scheme instead of alternate stylesheet sets."
tags: ["head", "meta", "style"]
impacts: ["maintainability"]
related: ["meta/http-equiv-content-type"]
---

No browser UI exposes the stylesheet switch `default-style` names. A
`<meta http-equiv="default-style">` sets the name of the default CSS style
sheet set: its `content` names the preferred alternate stylesheet by the
stylesheet's `title` attribute. The mechanism dates to the era of user-selectable
alternate stylesheets, when a browser was expected to let the reader switch
between titled sets. That picker no longer exists in any mainstream browser UI,
so the tag points at machinery with no operator.

## Why avoid

Nobody can flip the switch. Alternate stylesheets surface in essentially no
browser UI: Firefox's Page Style submenu is the last remnant, and elsewhere an
extension is required. A preference no reader can express is a dead control.

The machinery around it is dying. `document.preferredStyleSheetSet`, the API
this pragma feeds, is marked Deprecated and Non-standard on MDN, and alternate
stylesheets are not Baseline. The pragma is conforming, but it points at a
system being removed around it.

A third of observed values do not even parse. Roughly 31% of `default-style`
values in the wild are invalid, the most popular being `text/css`: a content
type where a stylesheet `title` belongs. Copy-paste nobody can catch, because
there is no reader to complain.

Where it works, it flashes. A late-applied preference visibly re-renders the
page: unstyled content first, then the preferred set, with the mechanism fighting
the parser it sits inside.

## Use instead

Media features, which follow live user preferences with no markup switch:

```css
body { background: white; color: black; }

@media (prefers-color-scheme: dark) {
  body { background: black; color: white; }
}
```

Migrate the variants to modern CSS first, then delete the tag.

## Detectability

Fully detectable. One element, one attribute value; no context changes the
verdict, so the rule matches the value case-insensitively and nothing else
is needed.

The fix is deliberately `none`. Where `content` matches a stylesheet `title`
the preference applies, so deletion changes rendering. Removing the tag is only
safe after the alternate set it selects has been migrated away.

## Resources

- [HTML Standard: Pragma directives](https://html.spec.whatwg.org/multipage/semantics.html#pragma-directives): lists `default-style` as a conforming keyword that sets the default CSS style sheet set name.
- [MDN: rel="alternate stylesheet"](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/alternate_stylesheet): documents limited availability and no browser UI without an extension, and recommends `prefers-color-scheme`/`prefers-contrast` instead.
- [MDN: document.preferredStyleSheetSet](https://developer.mozilla.org/en-US/docs/Web/API/Document/preferredStyleSheetSet): carries Deprecated and Non-standard badges on the API this pragma feeds.
- [You probably don't need http-equiv meta tags](https://rviscomi.dev/2023/07/you-probably-dont-need-http-equiv-meta-tags/): reports ~1k sites and ~31% invalid values, demonstrates the preference applying with a visible re-render, and recommends modern CSS.
