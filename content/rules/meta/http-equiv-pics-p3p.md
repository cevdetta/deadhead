---
ruleId: "meta/http-equiv-pics-p3p"
title: "meta http-equiv=pics-label / p3p"
description: "PICS labels and P3P policies are retired vocabularies whose only consumer was Internet Explorer; the tags do nothing, so delete them."
pubDate: "2026-09-14"
status: "avoid"
severity: "unnecessary"
standardsBasis: "spec-obsolete"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'meta[http-equiv="pics-label" i], meta[http-equiv="p3p" i]'
fix: { op: "remove-element" }
replacement: "Delete the tag. Publish a human-readable privacy policy instead; content descriptions belong in linked Description Resources, not markup."
tags: ["http-equiv"]
impacts: ["maintainability"]
related: ["meta/http-equiv-set-cookie"]
---

Two retired W3C vocabularies linger in `<meta>` tags. PICS labels rated
content for IE's Content Advisor; P3P policies declared privacy practices
in machine-readable XML, gated in practice only by IE's third-party-cookie
handling. W3C obsoleted P3P in 2018 ("should no longer be used as a basis
for implementation") and superseded PICS with POWDER back in 2009.

## Why avoid

Both vocabularies are dead and their only reader is retired. No current
user agent interprets P3P. W3C's obituary cites limited deployment and
copy-pasted policies that reflected nobody's actual practices. Microsoft
removed P3P support in Windows 10 with instructions not to
deploy it. POWDER deliberately dropped PICS's one HTML-embedded
capability: descriptions now live in discrete documents linked from the
page, keeping description maintenance separate from the described
resource. With IE gone, a `pics-label` or `p3p` tag is addressed to
nobody.

## Use instead

Delete the tag.

## Detectability

Fully detectable. The rule reports either attribute value outright: a
two-branch selector is the whole rule, and the fix always removes the
element.

## Resources

- [W3C: P3P 1.0 obsoleted 30 August 2018](https://www.w3.org/TR/2018/OBSL-P3P-20180830/): obsolete, do not implement; no current user agent interprets P3P policies.
- [W3C: PICS Superseded by POWDER (2009)](https://www.w3.org/2009/08/pics_superseded.html): no further PICS development; POWDER deliberately drops HTML-embedded labels.
- [Microsoft Learn: P3P is no longer supported (archived IE docs)](https://learn.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/compatibility/mt146424(v=vs.85)): P3P obsolete in Windows 10, support removed, do not deploy.
