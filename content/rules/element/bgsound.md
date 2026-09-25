---
ruleId: "element/bgsound"
title: "<bgsound>"
description: "bgsound was Internet Explorer's background sound. Browsers now treat it as unknown and play nothing. Use audio with controls."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "any"
selector: "bgsound"
fix: { op: "none" }
replacement: "Offer sound the user starts: <audio controls src=\"/theme.mp3\"></audio>. Never autoplay."
tags: ["media"]
impacts: ["a11y", "maintainability"]
related: ["element/basefont", "element/marquee"]
---

`<bgsound>` plays nothing. `<bgsound src="theme.mid" loop="-1">` started a sound as the
page loaded and, with that `loop`,
played it forever. Visitors had no button to stop it, because the element had no interface at
all. It was an Internet Explorer feature, and it went wherever Internet Explorer went.

## Why avoid

It is obsolete and non-conforming. The HTML Standard lists `bgsound` among the elements that
"are entirely obsolete, and must not be used by authors", and says what to do instead: "Use
audio instead."

It plays nothing. The Standard maps `bgsound` to `HTMLUnknownElement`, the same interface as
a tag it has never heard of, and defines no fetching, no playback and no rendering for it. The
sound only ever existed in Internet Explorer's own engine, where Microsoft's archived reference
still documents it, including `loop="-1"`, which "Loops infinitely". A page carrying it today
promises a soundtrack no current browser will play.

What it did is the reason not to recreate it. Sound that starts by itself and can't be stopped
is exactly what WCAG 2.2 Success Criterion 1.4.2 Audio Control, Level A, exists to prevent.
Audio that plays automatically for more than three seconds must be pausable or have its own
volume control, because it drowns out the speech of a screen reader using the same speakers.
The Understanding document goes further: "we discourage the practice of automatically starting
sounds". `<bgsound>` offered no control of any kind.

## Use instead

Sound the visitor chooses to start:

```html
<audio controls src="/theme.mp3">
  <a href="/theme.mp3">Download the theme</a>
</audio>
```

The tempting modernisation, `<audio autoplay loop>`, rebuilds the accessibility failure
`bgsound` was. Leave `autoplay` and `loop` off.

## Detectability

Fully detectable by tag name. The rule matches the tag outright, in `<head>` or `<body>`:
the parser handles `bgsound` like
`<link>` wherever it appears, as a void element with no end tag.

There is no autofix. Deleting it would change nothing anyone hears, since it plays nothing,
but whether to remove it or replace it with real audio is the author's decision.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `bgsound` is entirely obsolete: "Use audio instead."
- [HTML Standard: Elements in the DOM](https://html.spec.whatwg.org/multipage/dom.html#elements-in-the-dom): the element interface for `bgsound` is `HTMLUnknownElement`.
- [Microsoft Learn (archived): IHTMLBGsound: loop property](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/aa704322(v=vs.85)): `bgsound` as an Internet Explorer engine API; `loop="-1"` loops infinitely.
- [W3C: Understanding WCAG 2.2 SC 1.4.2: Audio Control](https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html): auto-playing audio needs a pause or volume control; starting sound automatically is discouraged.
