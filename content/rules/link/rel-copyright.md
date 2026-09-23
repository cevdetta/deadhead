---
ruleId: "link/rel-copyright"
title: "link rel=\"copyright\""
description: "copyright is a non-conforming synonym of license: user agents still read it as license, and documents must not use it."
pubDate: "2026-09-23"
status: "avoid"
severity: "deprecated"
standardsBasis: "spec"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'link[rel~="copyright" i]'
fix: { op: "none" }
replacement: "Rename the keyword to license when the target states license terms: <link rel=\"license\" href=\"/license\">. For a bare copyright notice, drop the link and keep the notice in the footer."
tags: ["hyperlinks"]
impacts: ["maintainability"]
related: ["link/obsolete-rel", "link/rel-html4-navigation"]
---

HTML 4 named the page's copyright terms with `<link rel="copyright">`. The living HTML
Standard renamed the relation to `license` and kept the old spelling as a synonym that
user agents honour and authors must not write.

## Why avoid

The HTML Standard folds `copyright` into `license`. The `license` entry says the keyword
"indicates that the referenced document provides the copyright license terms under which
the main content of the current document is provided", then adds: "For historical
reasons, user agents must also treat the keyword "copyright" like the license keyword."
The link-types section sets the author side: synonyms "are to be handled as specified by
user agents, but must not be used in documents (for example, the keyword "copyright")."
MDN repeats it: "the synonym `copyright` is incorrect and must be avoided."

The link still works, which is why the severity is `deprecated`: the spelling is the
obsolete one, and the relation behind it is live. The cost is a second spelling for one
relation. The Nu validator flags it, and a codebase that uses both spellings gets
searched for one and misses the other.

The verdict has a standing objection. whatwg/html#3724, "Allow link rel=copyright to be
conforming", has been open since 2018: the keyword was part of HTML 4 and user agents must
handle it anyway. A spec editor answered that there are "plenty of features UAs must
handle that authors must not use", and the text still forbids it.

## Use instead

```html
<link rel="license" href="/license">
```

Check the target first. `license` says the linked page states the license terms. A page
that holds a bare copyright notice is not that; drop the `<link>` and keep the notice in
the footer.

## Detectability

Detectable with the selector alone, with `~=` because `rel` is a token set and `i` because
keywords are ASCII case-insensitive. The CLI, the bookmarklet and the ESLint plugin all
report; none skips.

There is no autofix. The repair is a rename, and every fix op subtracts. Stripping the
keyword would delete a link user agents read as `license`, which changes behaviour.

`<a rel="copyright">` and `<area rel="copyright">` carry the same author requirement and
stay out of this head-scoped rule.

## Resources

- [HTML Standard §4.6.8.10: Link type "license"](https://html.spec.whatwg.org/multipage/links.html#link-type-license): "user agents must also treat the keyword "copyright" like the license keyword".
- [HTML Standard §4.6.8: Link types](https://html.spec.whatwg.org/multipage/links.html#linkTypes): synonyms "must not be used in documents (for example, the keyword "copyright")".
- [MDN: rel](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel): "Although recognized, the synonym `copyright` is incorrect and must be avoided."
- [whatwg/html#3724: Allow link rel=copyright to be conforming](https://github.com/whatwg/html/issues/3724): the standing objection, open since 2018-05-30.
