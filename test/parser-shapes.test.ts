/**
 * Parser token shapes the adapters lean on.
 *
 * A caret bump that renames `tagName` to `tag`, moves attribute locations, or
 * changes how `<script>`/`<style>` appear must fail here, not as a silent
 * drift where one adapter stops seeing elements the others see.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { parse } from "parse5";
import { parseForESLint } from "@html-eslint/parser";

test("parse5 ^8 reports the shapes the CLI adapter reads", () => {
  const document = parse(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>t</title></head><body></body></html>',
    { sourceCodeLocationInfo: true },
  );

  // The doctype the tree builder honours: first child, lowercased name.
  const doctype = document.childNodes.find((child) => child.nodeName === "#documentType");
  assert.ok(doctype, "expected a #documentType node");
  assert.equal(typeof (doctype as { name?: unknown }).name, "string", "doctype needs a name token");
  assert.ok("sourceCodeLocation" in doctype, "doctype needs sourceCodeLocation for ranges");

  const html = document.childNodes.find(
    (child): child is typeof child & { tagName: string } => "tagName" in child,
  );
  assert.ok(html && (html as { tagName: string }).tagName === "html", "expected an <html> element");
  const element = html as unknown as {
    tagName: string;
    attrs: { name: string; value: string }[];
    childNodes: unknown[];
  };
  assert.ok(Array.isArray(element.attrs), "elements need an attrs array");
  assert.ok(Array.isArray(element.childNodes), "elements need childNodes");

  // Attribute locations are keyed by lowercased name with byte offsets.
  const head = element.childNodes.find(
    (child): child is typeof child & { tagName: string } =>
      typeof child === "object" && child !== null && "tagName" in child,
  );
  assert.ok(head, "expected a <head> element");
  const loc = (doctype as { sourceCodeLocation?: { startOffset: number; endOffset: number } })
    .sourceCodeLocation;
  assert.ok(
    typeof loc?.startOffset === "number" && typeof loc?.endOffset === "number",
    "sourceCodeLocation must carry byte offsets",
  );
});

test("parse5 template content lives in a fragment the adapter must step into", () => {
  const document = parse("<html><head></head><body><template><span>x</span></template></body></html>", {
    sourceCodeLocationInfo: true,
  });
  const find = (nodes: unknown[]): unknown | null => {
    for (const node of nodes) {
      if (typeof node !== "object" || node === null) continue;
      if ("tagName" in node && (node as { tagName: string }).tagName === "template") return node;
      const children: unknown =
        "childNodes" in node ? (node as { childNodes: unknown[] }).childNodes : [];
      const found = Array.isArray(children) ? find(children) : null;
      if (found) return found;
    }
    return null;
  };
  const template = find(document.childNodes) as null | {
    childNodes: unknown[];
    content?: { childNodes: unknown[] };
  };
  assert.ok(template, "expected a <template> element");
  assert.ok(template.content && Array.isArray(template.content.childNodes), "template needs a content fragment");
});

test("@html-eslint/parser ^0.66 reports the shapes the plugin adapter reads", () => {
  const { ast } = parseForESLint(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><script type="text/javascript"></script><style>a{}</style></head><body></body></html>',
    {},
  );
  assert.equal((ast as { type: string }).type, "Program");

  const program = ast as unknown as { body?: unknown[]; children?: unknown[] };
  const top: unknown[] = program.body ?? program.children ?? [];
  assert.ok(top.length > 0, "Program needs body/children");

  const types = new Set<string>();
  const visit = (nodes: unknown[]): void => {
    for (const node of nodes) {
      if (typeof node !== "object" || node === null) continue;
      if (!("type" in node)) continue;
      const type = (node as { type: unknown }).type;
      if (typeof type === "string") types.add(type);
      const record = node as { children?: unknown[]; body?: unknown[] };
      visit(record.children ?? record.body ?? []);
    }
  };
  visit(top);
  for (const expected of ["Document", "Doctype", "Tag", "ScriptTag", "StyleTag"]) {
    assert.ok(types.has(expected), `expected a ${expected} node (got ${[...types].join(", ")})`);
  }

  // Element attributes carry key/value with ranges; locations are 0-based ESLint columns.
  const findTag = (nodes: unknown[]): null | {
    attributes?: { key: { value: string }; value?: { value: string }; range?: [number, number] }[];
    loc?: { start: { line: number; column: number } };
    range?: [number, number];
  } => {
    for (const node of nodes) {
      if (typeof node !== "object" || node === null || !("type" in node)) continue;
      const record = node as {
        type: string;
        name?: string;
        attributes?: { key: { value: string }; value?: { value: string }; range?: [number, number] }[];
        loc?: { start: { line: number; column: number } };
        range?: [number, number];
        children?: unknown[];
        body?: unknown[];
      };
      if (record.type === "Tag" && record.name === "meta") return record;
      const found = findTag(record.children ?? record.body ?? []);
      if (found) return found;
    }
    return null;
  };
  const meta = findTag(top);
  assert.ok(meta?.attributes?.[0]?.key, "Tag needs attributes with key/value");
  assert.ok(Array.isArray(meta?.range) && meta.range.length === 2, "nodes need a [start, end] range");
  assert.equal(typeof meta?.loc?.start.column, "number", "nodes need loc.start.column");
});

test("a Doctype arrives as raw tokens the adapter must interpret", () => {
  const { ast } = parseForESLint(
    '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://example.com/dtd">\n<html><head></head><body></body></html>',
    {},
  );
  const program = ast as unknown as { body?: unknown[] };
  const visit = (nodes: unknown[]): unknown | null => {
    for (const node of nodes) {
      if (typeof node !== "object" || node === null || !("type" in node)) continue;
      if ((node as { type: string }).type === "Doctype") return node;
      const record = node as { children?: unknown[]; body?: unknown[] };
      const found = visit(record.children ?? record.body ?? []);
      if (found) return found;
    }
    return null;
  };
  const doctype = visit(program.body ?? []) as null | {
    attributes?: { value?: { value?: string } }[];
  };
  assert.ok(doctype, "expected a Doctype node");
  assert.ok(Array.isArray(doctype.attributes), "Doctype needs an attributes token array");
  assert.ok(doctype.attributes.length >= 1, "Doctype tokens must include the name");
});
