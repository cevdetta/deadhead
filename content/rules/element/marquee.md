---
ruleId: "element/marquee"
title: "<marquee>"
description: "marquee is obsolete, yet every browser still scrolls it; auto-scrolling text with no pause control fails WCAG 2.2.2 Pause, Stop, Hide."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "marquee"
fix: { op: "none" }
replacement: "Drop the tag and keep its content static. If it must move, use a CSS animation with a visible pause button and turn it off under prefers-reduced-motion."
tags: ["presentational"]
impacts: ["a11y", "maintainability"]
related: ["element/blink", "element/bgsound"]
---

`<marquee>` scrolls text no reader can pause. `<marquee>Breaking news…</marquee>` slides
its content across the page, over and over, for as
long as the page stays open. Internet Explorer introduced it in the 1990s, every other browser
copied it so that pages built for IE would keep working, and it never left. It still turns up in
old templates, school pages and intranet notice boards.

## Why avoid

It is obsolete for authors and, unlike `<blink>`, alive in every browser. The HTML Standard lists
`marquee` among the elements that "are entirely obsolete, and must not be used by authors". The
same standard then keeps a full implementation section for it, opening with: "The `marquee`
element is a presentational element that animates content. CSS transitions and animations are a
more appropriate mechanism." Browsers must implement `HTMLMarqueeElement`, the element is turned
on the moment it is created, and the rendering section expects it, while turned on, "to render in
an animated fashion according to its attributes". When one pass ends and the element is still on,
"the user agent is expected to restart the animation". So the text moves from the first paint and,
by default, never stops. The spec keeps all of this only so that old pages don't break.

That motion is an accessibility failure. WCAG 2.2 Success Criterion 2.2.2 Pause, Stop, Hide,
Level A, requires a way to pause, stop or hide any "moving, blinking or scrolling information that
(1) starts automatically, (2) lasts more than five seconds, and (3) is presented in parallel with
other content". A marquee meets all three and offers no control: `stop()` exists only for scripts,
and nothing is exposed to the reader. W3C's failure technique F16 describes exactly this, "moving
or scrolling content that cannot be paused and resumed by users", and names the consequence: "some
users with low vision or cognitive disabilities will not be able to perceive the content". Its
example is a page with "a scrolling news ticker without a mechanism to pause it".

The tempting fix repeats the failure. Replacing the tag with a CSS animation and nothing else is
the same F16 in different markup.

## Use instead

Most of the time nothing should move. Keep the text and drop the tag:

```html
<p><strong>Breaking:</strong> trains on line 3 are delayed until 18:00.</p>
```

If the content has to scroll, animate it in CSS, give the reader a visible pause
button, and switch the motion off for people who have asked their system for less of it:

```html
<button type="button" aria-controls="ticker">Pause</button>
<div class="ticker" id="ticker">
  <p>Trains on line 3 are delayed until 18:00.</p>
</div>
```

```css
.ticker { overflow: hidden; }
.ticker p {
  margin: 0;
  width: max-content;
  white-space: nowrap;
  padding-inline-start: 100%;
  animation: ticker 20s linear infinite;
}
.ticker.paused p { animation-play-state: paused; }
@keyframes ticker { to { transform: translateX(-100%); } }
@media (prefers-reduced-motion: reduce) {
  .ticker p { animation: none; padding-inline-start: 0; }
}
```

```js
const ticker = document.getElementById("ticker");
document.querySelector("[aria-controls=ticker]").addEventListener("click", (event) => {
  const paused = ticker.classList.toggle("paused");
  event.currentTarget.textContent = paused ? "Play" : "Pause";
});
```

The button is the mechanism SC 2.2.2 asks for. The media query honours the operating system's
reduce-motion setting: Media Queries Level 5 defines `prefers-reduced-motion: reduce` as the
user having told their system they want motion-based animation removed, reduced or replaced, and
in that case the text sits still.

## Detectability

Fully detectable by tag name. The rule matches the tag outright. There is no autofix:
removing the element would delete the text
inside it, and fixes can't unwrap an element to keep its content.

## Resources

- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `marquee` is entirely obsolete and must not be used by authors.
- [HTML Standard: Requirements for implementations: the marquee element](https://html.spec.whatwg.org/multipage/obsolete.html#the-marquee-element): browsers must implement `HTMLMarqueeElement`; the element is turned on when created; "CSS transitions and animations are a more appropriate mechanism".
- [HTML Standard: Rendering: the marquee element](https://html.spec.whatwg.org/multipage/rendering.html#the-marquee-element-2): while turned on it is expected to animate, and to restart when a pass ends.
- [W3C: Understanding WCAG 2.2 SC 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html): auto-starting scrolling content that lasts more than five seconds needs a pause, stop or hide mechanism.
- [W3C: WCAG Technique F16: scrolling content without a mechanism to pause and restart it](https://www.w3.org/WAI/WCAG22/Techniques/failures/F16): the failure a marquee commits; the news-ticker example.
- [Media Queries Level 5: prefers-reduced-motion](https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion): the media feature the replacement is gated on.
