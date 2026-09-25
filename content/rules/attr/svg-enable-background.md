---
ruleId: "attr/svg-enable-background"
title: "<svg enable-background>"
description: "enable-background fed SVG 1.1's BackgroundImage filter input; Filter Effects dropped it and browsers never shipped it, so delete it."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "svg[enable-background], g[enable-background], symbol[enable-background], defs[enable-background], marker[enable-background], mask[enable-background], pattern[enable-background], switch[enable-background], a[enable-background]"
fix: { op: "remove-attribute", attr: "enable-background" }
replacement: "Delete the attribute. To blend against what sits behind, use isolation: isolate with mix-blend-mode; to filter the backdrop, backdrop-filter."
tags: ["svg"]
impacts: ["maintainability"]
related: ["attr/svg-version", "attr/svg-baseprofile", "attr/svg-xlink"]
---

`enable-background="new 0 0 24 24"` sits on the root of icons exported from Illustrator
and Inkscape. It belonged to an SVG 1.1 filter feature that let a filter read what was
painted behind it. Filter Effects dropped the feature, and the current engines never
built it.

## Why avoid

SVG 1.1 gave filters two pseudo-inputs, `BackgroundImage` and `BackgroundAlpha`.
`enable-background="new"` on a container told the renderer to paint the container's
children into a second canvas those inputs could read, and the property "is only
applicable to container elements". Filter Effects Module Level 1, which replaced the SVG
1.1 filter chapter, took the model out: "The concept defined by this property was
identified to be incompatible with the model of stacking context in CSS", and "This
specification does not support the enable-background property. UAs must support the
isolation property instead."

No current engine reads it. Blink's and WebKit's CSS property lists carry no
`enable-background`, and WebKit's list of SVG attribute names leaves it out. Mozilla bug
437554, "Implement BackgroundImage/BackgroundAlpha for filters", has sat at NEW since
2008-06-06. The attribute reaches HTML with every pasted icon and does nothing there.

## Use instead

Delete the attribute:

```html
<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
  <path d="M4 12h16"/>
</svg>
```

For the effect the feature was after, CSS has it now:

```css
.card { isolation: isolate; }
.card .badge { mix-blend-mode: multiply; }
```

`backdrop-filter` covers filtering what sits behind an element.

## Detectability

Detectable with the selector alone. The selector lists SVG 1.1's container elements,
since the property applied to nothing else, minus `glyph` and `missing-glyph`, which
live inside SVG fonts and never in inline icon markup.

The fix removes the attribute. With no engine that implements the property, deleting it
changes nothing a browser draws. The CLI and the ESLint plugin report and fix; the
bookmarklet reports without a fix, having no source text.

Illustrator also writes the property into `style="enable-background:new …"`. The
selector cannot read inside `style`, so that form goes unreported.

## Resources

- [SVG 1.1 (Second Edition) §15.6: Accessing the background image](https://www.w3.org/TR/SVG11/filters.html#EnableBackgroundProperty): defines the property; it "is only applicable to container elements".
- [Filter Effects Module Level 1, Appendix A](https://www.w3.org/TR/filter-effects-1/#AccessBackgroundImage): Working Draft, 2018-12-18; "This specification does not support the enable-background property. UAs must support the isolation property instead."
- [Mozilla bug 437554](https://bugzilla.mozilla.org/show_bug.cgi?id=437554): "Implement BackgroundImage/BackgroundAlpha for filters", NEW since 2008-06-06.
- [Chromium: css_properties.json5](https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/css/css_properties.json5): Blink's CSS property list, with no `enable-background`.
- [WebKit: CSSProperties.json](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/css/CSSProperties.json): WebKit's CSS property list, with no `enable-background`.
