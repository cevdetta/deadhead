/**
 * The contracts rule logic is allowed to see.
 *
 * Rules never touch a parser. A rule that imports `parse5`, a DOM `Element` or
 * an ESLint AST node has hard-coded one of the three runtimes and the
 * conformance suite will diverge. Everything below is implemented identically
 * by `packages/cli/adapter.ts`, `packages/browser/adapter.ts` and
 * `packages/eslint-plugin/adapter.ts`.
 *
 * These declarations move into `@deadhead/core` in M1 and are re-exported from
 * here; they live here for now because `core` does not exist yet and logic
 * modules cannot be typechecked without them. The shapes are transcribed from
 * the "Core contracts" section of CLAUDE.md — change them there first.
 */

/** Mirrors `severity` in the rule frontmatter (see `scripts/schema.ts`). */
export type Severity = "harmful" | "deprecated" | "unnecessary";

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

/** What a `kind: "document"` rule sees. The selector subset is the same one. */
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
