/**
 * One pass over the element tree, tagging each node with the region it is in.
 *
 * `scope` is the main performance lever in the project: a document whose rules
 * are all `scope: "head"` never descends into `<body>` at all, which on a real
 * page is the difference between a dozen nodes and a few thousand.
 */

import type { ElementPort } from "./types.ts";

/** Which half of the document a node is in. `null` is neither (`<html>` itself). */
export type Region = "head" | "body" | null;

/**
 * Markup inside these is content, not markup to lint. A `<code>` sample of a
 * bad `<meta>` tag is the whole point of a rule's documentation, and flagging
 * it would make the tool unusable on its own site. The container itself is
 * still visited; only its descendants are skipped.
 *
 * The second group is parsed as text by the HTML Standard (raw text or RCDATA,
 * and `noscript` with scripting enabled), so a spec parser never builds
 * elements inside them. parse5 follows the spec; linkedom and
 * `@html-eslint/parser` do not, and without this they report findings inside
 * that parse5 cannot see. `plaintext` is left out: it has no end tag, so
 * skipping its descendants cannot make the adapters agree about what follows.
 */
const OPAQUE = new Set([
  "pre",
  "code",
  "textarea",
  "samp",
  "kbd",
  "iframe",
  "noembed",
  "noframes",
  "noscript",
  "title",
  "xmp",
]);

export type WalkOptions = {
  /** Skip descending into `<body>` when no rule is scoped to reach it. */
  visitBody?: boolean;
  /** `<template>` content is inert markup; opt out of linting it. */
  skipTemplates?: boolean;
};

export function walk(
  root: ElementPort | null,
  visit: (element: ElementPort, region: Region) => void,
  options: WalkOptions = {},
): void {
  if (root === null) return;
  const visitBody = options.visitBody ?? true;
  const skipTemplates = options.skipTemplates ?? false;

  const descend = (element: ElementPort, inherited: Region): void => {
    const tag = element.tag;
    const region: Region = tag === "head" ? "head" : tag === "body" ? "body" : inherited;

    if (region === "body" && !visitBody) return;
    if (skipTemplates && tag === "template") return;

    visit(element, region);

    if (OPAQUE.has(tag)) return;
    for (const child of element.children()) descend(child, region);
  };

  descend(root, null);
}
