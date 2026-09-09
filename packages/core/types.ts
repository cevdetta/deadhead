/**
 * The contracts every adapter implements and every rule is written against.
 *
 * Rules never touch a parser. A rule that imports `parse5`, a DOM `Element` or
 * an ESLint AST node has hard-coded one of the three runtimes, and the
 * conformance suite will diverge. If a rule needs something the port lacks,
 * extend the port for all three adapters at once.
 */

import type { Fix } from "./fix.ts";
import type { Severity } from "./vocabulary.ts";

export type Loc = { line: number; col: number };

/** Offsets into the original source text — the range the fixer splices. */
export type Range = readonly [start: number, end: number];

export type ElementPort = {
  /** Lowercase tag name. */
  readonly tag: string;
  /** Attribute value, name matched case-insensitively. */
  attr(name: string): string | undefined;
  hasAttr(name: string): boolean;
  /** Lowercase attribute names. */
  attrNames(): string[];
  /**
   * Source range of one attribute, name and value together, for the fixer to
   * splice out. `null` when the attribute is absent, and always `null` in the
   * DOM adapter, which has no source text.
   */
  attrRange(name: string): Range | null;
  /** Concatenated text of all descendants. */
  text(): string;
  /** Element-only parent. */
  parent(): ElementPort | null;
  /** Element-only children. */
  children(): ElementPort[];
  /** Position among element siblings. */
  index(): number;
  /** `null` in the DOM adapter, where there is no source text. */
  range(): Range | null;
  /** 1-based. `null` in the DOM adapter. */
  loc(): Loc | null;
};

/** What a `kind: "document"` rule sees. Selectors use the same subset. */
export type DocumentPort = {
  querySelector(selector: string): ElementPort | null;
  querySelectorAll(selector: string): ElementPort[];
};

export type Finding = {
  ruleId: string;
  severity: Severity;
  /** `detectability: "partial"` — reported as "possible", never autofixed. */
  possible: boolean;
  message: string;
  replacement: string;
  url: string;
  loc: Loc | null;
  range: Range | null;
  /** `snippet` is truncated to 90 characters. */
  node: { tag: string; snippet: string };
  detail?: string;
  /**
   * The edit that resolves this finding, or `null` where there is not one —
   * `fix: { op: "none" }`, a `partial` rule that must not guess, or an adapter
   * with no source text. Carried on the finding so the CLI and ESLint can both
   * offer it without walking the document a second time.
   */
  fix: Fix | null;
};

export type RuleContext = {
  readonly ruleId: string;
  /** Build a finding for this element, filling in everything from frontmatter. */
  report(element: ElementPort, extra?: { detail?: string }): Finding;
};

/** `kind: "element"` with `match: "logic"`: the selector pre-filters, this decides. */
export type MatchFn = (element: ElementPort, ctx: RuleContext) => boolean;

/** `kind: "document"`: no selector can express it, so the rule walks the document. */
export type CheckFn = (doc: DocumentPort, ctx: RuleContext) => Finding[];

/**
 * What an adapter hands the engine: the tree to walk, the document rules see,
 * and the original text.
 *
 * `source` is `null` in the DOM adapter. Everything that needs it — source
 * ranges, suppression comments — degrades to "unavailable" rather than wrong.
 */
export type Parsed = {
  /** The `<html>` element, or `null` for an empty document. */
  root: ElementPort | null;
  doc: DocumentPort;
  source: string | null;
};
