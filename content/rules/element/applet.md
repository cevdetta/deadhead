---
ruleId: "element/applet"
title: "applet element"
description: "applet is obsolete and nothing can run it: no browser loads Java applets, and the JDK itself removed the Applet API; only the fallback text shows."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "body"
selector: "applet"
fix: { op: "none" }
replacement: "Nothing will run the applet. Rebuild the feature with web platform features (canvas, video, audio, form controls, JavaScript), or link to the program as a download."
tags: ["legacy"]
impacts: ["interop", "maintainability"]
related: ["element/bgsound", "element/isindex"]
---

`<applet code="Clock.class">` embedded a Java program in the page, run by a Java plug-in inside the
browser. The markup still turns up in old pages, usually with a "you need Java" message inside it.

## Why avoid

It is obsolete, and nothing runs it. The HTML Standard lists `applet` among the elements that
"are entirely obsolete, and must not be used by authors". The DOM section maps it to
`HTMLUnknownElement`, the rendering section defines nothing for it, and `document.applets` is
required to return a collection "whose filter matches nothing. (It exists for historical
reasons.)" A browser parses the tag and does nothing else with it. Like any unknown element, its
children still show, so the fallback text inside is all a visitor sees.

The Java side is gone too. JEP 289 deprecated the Applet API in JDK 9 because it was "rapidly
becoming irrelevant as web-browser vendors remove support for Java browser plug-ins". JEP 398
marked it for removal in JDK 17, since "all web-browser vendors have either removed support for
Java browser plug-ins or announced plans to do so". JEP 504 removed it in JDK 26: "neither recent
JDK releases nor current web browsers support applets."

So the page has quietly lost whatever the applet did. The markup gives no warning, and nobody
maintaining the page is told the feature is dead.

## Use instead

There is no drop-in replacement. The spec's hint, "Use embed or object instead", doesn't help
here: pointing `<object>` or `<embed>` at a Java applet runs nothing either, because the plug-in
no longer exists. Rebuild the feature with the web platform instead:

- Drawing, charts and simple games: `<canvas>` with JavaScript.
- Media players: `<video>` and `<audio>`.
- Calculators and forms: form controls and JavaScript.

```html
<canvas id="clock" width="200" height="200">A clock showing the current time.</canvas>
```

If the program has to stay a Java application, link to it as a download rather than embedding it.

## Detectability

Fully detectable by tag name. There is no autofix: removing the element would also remove its
fallback content, which is the only part that still reaches visitors.

## Resources

- [HTML Standard — Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features) — `applet` is entirely obsolete.
- [HTML Standard — Elements in the DOM](https://html.spec.whatwg.org/multipage/dom.html#elements-in-the-dom) — `applet` maps to `HTMLUnknownElement`.
- [HTML Standard — document.applets](https://html.spec.whatwg.org/multipage/obsolete.html#dom-document-applets) — the collection matches nothing and exists only for historical reasons.
- [JEP 289: Deprecate the Applet API](https://openjdk.org/jeps/289) — deprecated in JDK 9 as browser vendors removed Java plug-in support.
- [JEP 398: Deprecate the Applet API for Removal](https://openjdk.org/jeps/398) — all browser vendors had removed Java plug-in support or announced its removal.
- [JEP 504: Remove the Applet API](https://openjdk.org/jeps/504) — removed in JDK 26; neither current JDKs nor browsers support applets.
