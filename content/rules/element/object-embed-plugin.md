---
ruleId: "element/object-embed-plugin"
title: "<object>, <embed> plug-in content"
description: "This object or embed loads a Flash, Java or Silverlight plug-in. Browsers run no plug-ins, so the content stays blank."
pubDate: "2026-09-14"
status: "avoid"
severity: "deprecated"
standardsBasis: "browser-convention"
detectability: "yes"
kind: "element"
scope: "body"
selector: 'object[type="application/x-shockwave-flash" i], embed[type="application/x-shockwave-flash" i], object[type="application/futuresplash" i], embed[type="application/futuresplash" i], object[type^="application/x-java-applet" i], embed[type^="application/x-java-applet" i], object[type^="application/x-java-bean" i], embed[type^="application/x-java-bean" i], object[type^="application/x-silverlight" i], embed[type^="application/x-silverlight" i], object[data$=".swf" i], embed[src$=".swf" i], object[classid]'
fix: { op: "none" }
replacement: "Rebuild the content with web platform features: <video> or <audio> for media, <canvas> and JavaScript for interactive content. Keep object and embed only for documents such as PDFs."
tags: ["embedding"]
impacts: ["interop", "maintainability"]
related: ["element/applet"]
---

Plug-in content stays blank. `<object>` and `<embed>` load external content into a
page. For years, their main job was starting
a browser plug-in: Adobe Flash for `.swf` files and the Java plug-in for applets.
Microsoft Silverlight played video. That markup still turns up in old pages, with a "get
Flash Player" link as
fallback.

## Why avoid

Nothing can run it any more. Browsers dropped plug-ins, and the plug-ins' own vendors withdrew
them.

- **Browsers.** Chrome removed its plug-in interface years ago. The Chromium team announced that
  "in September 2015 we will remove the override and NPAPI support will be permanently removed
  from Chrome."
- **Flash.** Adobe "stopped supporting Flash Player beginning December 31, 2020", "blocked Flash
  content from running in Flash Player beginning January 12, 2021", and "strongly recommends all
  users immediately uninstall Flash Player to help protect their systems."
- **Java.** JEP 398 deprecated the Applet API for removal because "all web-browser vendors have
  either removed support for Java browser plug-ins or announced plans to do so."
- **Silverlight.** Microsoft's lifecycle page ends support for Silverlight 5 in October 2021.

The `classid` attribute is also obsolete in the HTML Standard, which says to "use the data and
type attributes to invoke plugins" instead. It only ever named an ActiveX control or a Java class.

A visitor sees the element's fallback content, or an empty box for `embed`, which has none.
Whatever the plug-in delivered is gone, and the page gives no warning.

## Use instead

Rebuild the content with the web platform. For video and audio, use the native elements:

```html
<video controls width="640" height="360" preload="metadata">
  <source src="intro.mp4" type="video/mp4">
</video>
```

For animations, games and interactive tools, use `<canvas>` with JavaScript, or plain HTML
controls.

`<object>` and `<embed>` are still fine for documents the browser can show itself:

```html
<object data="annual-report.pdf" type="application/pdf" width="800" height="600">
  <a href="annual-report.pdf">Download the annual report (PDF)</a>
</object>
```

## Detectability

Fully detectable, because the rule matches only known signatures of the three dead platforms:
their MIME types in `type`, a `data` or `src` URL ending in `.swf`, and any `object` with
`classid`. It never matches PDFs, SVG, images or HTML documents.

A `.swf` URL with a query string, such as `movie.swf?autoplay=1`, is not matched, unless the
element also declares a Flash `type` or `classid`. There is no autofix: an `object`'s fallback
content is the only part that still reaches visitors, and removing the element would remove it.

## Resources

- [Chromium Blog: The Final Countdown for NPAPI](https://blog.chromium.org/2014/11/the-final-countdown-for-npapi.html): plug-in support permanently removed from Chrome in September 2015.
- [Adobe: Flash Player End of Life](https://www.adobe.com/products/flashplayer/end-of-life.html): support ended on 31 December 2020, and Flash content has been blocked since 12 January 2021.
- [Microsoft Lifecycle: Silverlight 5](https://learn.microsoft.com/en-us/lifecycle/products/silverlight-5): support ended in October 2021.
- [JEP 398: Deprecate the Applet API for Removal](https://openjdk.org/jeps/398): browser vendors removed Java plug-in support.
- [HTML Standard: Non-conforming features](https://html.spec.whatwg.org/multipage/obsolete.html#non-conforming-features): `classid` on `object` is obsolete.
