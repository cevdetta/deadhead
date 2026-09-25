---
ruleId: "attr/bar"
title: "bar test"
description: "Bar is here."
pubDate: "2026-09-24"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'attr[bar]'
fix: { op: "remove-attribute", attr: "bar" }
replacement: "Delete it."
tags: ["test"]
impacts: ["maintainability"]
related: ["attr/foo-obsolete"]
---

## Why avoid

Test rule that references another.

See packages/rules/logic/attr/foo-obsolete.ts.

## Use instead

Nothing. Do not confuse with attr/foo-obsolete-extra which is different.

## Detectability

Always.

## Resources

1. Example resource.
2. Another resource.
