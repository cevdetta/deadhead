/**
 * Live DOM → element port.
 *
 * The bookmarklet's whole advantage is that it inspects *rendered* output:
 * whatever the framework, the CMS or the tag manager actually put in the
 * document, rather than what the source said. That is ground truth in a way
 * a file on disk is not.
 *
 * The cost is that there is no source text. `range()` and `loc()` return
 * `null`, fixes are unavailable, and suppression comments are not read. Every
 * one of those degrades to "unavailable" rather than to something wrong.
 */

import type { DocumentPort, ElementPort, Parsed } from "../core/types.ts";

const isTemplate = (element: Element): element is HTMLTemplateElement =>
  element.tagName.toLowerCase() === "template" && "content" in element;

/**
 * A `<template>`'s markup lives in its `content` fragment, not among its
 * children — the same trap the parse5 adapter has. Both adapters have to step
 * into it or the conformance suite compares two different documents.
 */
const childElements = (element: Element): Element[] =>
  isTemplate(element) ? [...element.content.children] : [...element.children];

function makePorts(): (element: Element) => ElementPort {
  const cache = new WeakMap<Element, ElementPort>();

  const portFor = (element: Element): ElementPort => {
    const cached = cache.get(element);
    if (cached) return cached;

    const port: ElementPort = {
      // `tagName` is uppercase for HTML elements in a real document.
      tag: element.tagName.toLowerCase(),
      attr: (name) => element.getAttribute(name) ?? undefined,
      hasAttr: (name) => element.hasAttribute(name),
      attrNames: () => [...element.getAttributeNames()].map((name) => name.toLowerCase()),
      // No source text, so no attribute range either — and therefore no fixes.
      attrRange: () => null,
      text: () => element.textContent ?? "",
      parent: () => {
        // A template's content lives in a fragment, so climb back to the
        // template element rather than stopping at the fragment.
        const parent = element.parentElement;
        if (parent !== null) return portFor(parent);
        const host = (element.parentNode as { host?: Element } | null)?.host;
        return host === undefined ? null : portFor(host);
      },
      children: () => childElements(element).map(portFor),
      index: () => {
        const parent = element.parentElement;
        return parent === null ? 0 : childElements(parent).indexOf(element);
      },
      // No source text in a live document: there is nothing to splice.
      range: () => null,
      loc: () => null,
    };

    cache.set(element, port);
    return port;
  };

  return portFor;
}

/**
 * Wrap a live document.
 *
 * `querySelector`/`querySelectorAll` hand the selector straight to the
 * browser. That is the reason the supported subset is restricted to things
 * `querySelectorAll` accepts verbatim: no translation layer, no second
 * implementation to keep in step.
 */
export function fromDocument(document: Document): Parsed {
  const portFor = makePorts();
  const root = document.documentElement;

  const doc: DocumentPort = {
    querySelector: (selector) => {
      const found = document.querySelector(selector);
      return found === null ? null : portFor(found);
    },
    querySelectorAll: (selector) => [...document.querySelectorAll(selector)].map(portFor),
  };

  return { root: root === null ? null : portFor(root), doc, source: null };
}
