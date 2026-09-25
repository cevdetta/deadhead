---
ruleId: "element/blink"
title: "<blink>"
description: "blink is obsolete and no current browser blinks it; don't recreate the effect, because blinking content fails WCAG 2.2.2 Pause, Stop, Hide."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "blink"
fix: { op: "none" }
replacement: "Nothing: drop the tag and keep its text. If something needs attention, use a static cue like <strong>, never motion."
tags: ["presentational"]
impacts: ["a11y", "maintainability"]
related: ["element/marquee", "element/bgsound"]
---

No browser blinks `<blink>`. `<blink>New!</blink>` switched its text on and off about
once a second, for as long as the page
stayed open. Netscape shipped it in the 1990s. It became shorthand for everything wrong with
early web design, and it has been gone from every browser for more than a decade. It still
turns up in old templates, pasted signatures and pages nobody has touched since.

## Why avoid

It is obsolete, and nothing blinks anymore. The HTML Standard lists `blink` among the elements
that "are entirely obsolete, and must not be used by authors", maps it to `HTMLUnknownElement`,
and defines no rendering for it at all. Firefox was the last engine that blinked. Mozilla removed
the element in Firefox 23, in 2013. The markup is dead: its text shows, like any unknown
inline element.

What it asked for is an accessibility failure, and that's the part worth remembering. WCAG 2.2
Success Criterion 2.2.2 Pause, Stop, Hide, Level A, requires that "moving, blinking or scrolling
information that (1) starts automatically, (2) lasts more than five seconds, and (3) is presented
in parallel with other content" can be paused, stopped or hidden. Blinking is singled out because
people with attention deficit disorders find it "distracting, making it difficult for them to
concentrate on other parts of the web page". W3C's failure technique for this exact element, F47,
is now itself marked obsolete, since "the blink element is obsolete in the HTML Living Standard
and currently has no modern browser support".

The danger today is the fix. Someone notices the tag does nothing and brings the effect back with
a CSS animation. That is the same failure under a new name: technique F112, "using blinking
content that lasts for more than five seconds without a mechanism to stop it".

## Use instead

Nothing. Remove the tag and keep the text:

```html
<p><strong>Offer ends tonight.</strong></p>
```

If something needs attention, make it static and meaningful: `<strong>` for
importance, or `role="alert"` for a message that has to be announced. Don't use motion.

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
removing the element would delete the text
inside it, and fixes can't unwrap an element to keep its content.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `blink` is entirely obsolete.
- [HTML Standard: Elements in the DOM](https://html.spec.whatwg.org/multipage/dom.html#elements-in-the-dom): `blink` maps to `HTMLUnknownElement`.
- [Mozilla Bugzilla 857820: completely remove `<blink>` element](https://bugzilla.mozilla.org/show_bug.cgi?id=857820): fixed for Firefox 23, the last browser that blinked.
- [W3C: Understanding WCAG 2.2 SC 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): blinking content must be pausable; why it harms users; F112 for CSS-recreated blinking.
- [W3C: WCAG Technique F47: using the blink element](https://www.w3.org/WAI/WCAG22/Techniques/failures/F47): the failure technique, marked obsolete because no modern browser supports the element.
