---
ruleId: "meta/viewport-user-scalable"
title: "<meta name=\"viewport\"> that disables zoom"
description: "A viewport with user-scalable=no or a maximum-scale below 2 stops people zooming to read, failing WCAG 1.4.4."
pubDate: "2026-09-13"
status: "avoid"
severity: "harmful"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[name="viewport" i][content*="user-scalable" i], meta[name="viewport" i][content*="maximum-scale" i]'
match: "logic"
fix: { op: "none" }
replacement: "Allow zoom: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">. Drop user-scalable=no and any maximum-scale below 2."
tags: ["mobile"]
impacts: ["a11y"]
related: ["head/viewport-missing"]
---

Disabling zoom takes reading away from the people who need it.
`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`
is copied into templates to make a site feel like an app: no
accidental zoom on double-tap and no input zoom on focus. The layout never shifts.
It does that by taking pinch-zoom away from everyone, including the people who can't read the
page without it.

## Why avoid

It fails a Level AA success criterion. WCAG 2.2 SC 1.4.4 Resize Text requires that text
"can be resized without assistive technology up to 200 percent without loss of content or
functionality". On a phone, pinch-zoom is that mechanism. `user-scalable=no` switches it
off, and a `maximum-scale` below 2 caps it short of 200%. Deque's axe-core reports exactly
this pattern as a critical violation of 1.4.4, and the threshold of 2 is the 200% in the
criterion.

It works where most people browse. Chromium's viewport parser maps `user-scalable=no`, and
also `0`, `false`, an empty value or any number between -1 and 1, to "no user zoom", and it
clamps zoom to `maximum-scale`. Chrome on Android and every Chromium-based browser therefore
lock the page at that scale, unless the user has found and enabled a force-zoom
accessibility setting.

Apple already decided it was harmful. From iOS 10, Safari ignores `user-scalable=no` and
lets users pinch-zoom every page. WebKit's explanation is the whole case against the tag:
it "enabled pages to pick a text size that was unreadable while giving the user no way to
zoom". The value harms readers where browsers honour it and does nothing elsewhere.
It never delivers the app-like feel it was added for.

## Use instead

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

Fix the specific annoyance instead of the whole page. iOS zooms into a focused input whose
text is smaller than 16px, so set `font-size: 1rem` or larger on form controls. If
double-tap zoom gets in the way of a control, `touch-action: manipulation` on that control
removes the double-tap delay without disabling pinch-zoom.

## Detectability

Fully detectable from the attribute. The rule narrows to viewports whose `content`
mentions `user-scalable` or `maximum-scale`, and the logic parses `content` the way browsers
do. Pairs are separated by commas, semicolons or whitespace, with
whitespace allowed around `=`. Keys are case-insensitive, and a later pair overrides an
earlier one. It reports when `user-scalable` is anything other than `yes`, `device-width`,
`device-height` or a number of magnitude 1 or more, or when `maximum-scale` is `yes`, `no`,
or a number from 0 up to but not including 2. A negative `maximum-scale` means `auto` and
isn't reported, and neither is an unrecognised word there.

Chromium treats a semicolon as an invalid separator, so a semicolon-separated
`user-scalable=no` does not take effect in Chrome. The rule reports it anyway. The markup states the
intent, and other engines have accepted semicolons.

There is no autofix. The problem is one pair inside `content`, which no fix op can edit,
and deleting the element would throw away the `width=device-width` the layout depends on.

## Resources

- [W3C: Understanding WCAG 2.2 SC 1.4.4: Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html): text resizable to 200% without loss of content or functionality, Level AA.
- [WebKit: New Interaction Behaviors in iOS 10](https://webkit.org/blog/7367/new-interaction-behaviors-in-ios-10/): Safari ignores `user-scalable=no` from iOS 10, and why.
- [Chromium: `third_party/blink/renderer/core/html/html_meta_element.cc`](https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/core/html/html_meta_element.cc): `ParseViewportValueAsUserZoom` and `ParseViewportValueAsZoom`: how `user-scalable` and `maximum-scale` values are read.
- [CSS Viewport Module: viewport meta parsing](https://drafts.csswg.org/css-viewport/): separators and case-insensitive matching of property names and values.
- [Deque: axe-core rule meta-viewport](https://dequeuniversity.com/rules/axe/4.10/meta-viewport): `user-scalable=no` or `maximum-scale` below 2 reported as a critical 1.4.4 failure.
