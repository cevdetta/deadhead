---
ruleId: "attr/foo-obsolete"
title: "foo test"
description: "Foo is obsolete."
pubDate: "2026-09-24"
status: "avoid"
severity: "unnecessary"
standardsBasis: "vendor"
detectability: "yes"
kind: "element"
scope: "head"
selector: 'attr[foo]'
fix: { op: "remove-attribute", attr: "foo" }
replacement: "Delete it."
tags: ["test"]
impacts: ["maintainability"]
---

## Why avoid

Test rule.

## Use instead

Nothing.

## Detectability

Always.

## Resources

1. Example resource.
2. Another resource.
