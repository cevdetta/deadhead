/**
 * Frontmatter + prose schema for `content/rules/**\/*.md`.
 *
 * Dependency-free on purpose: this file is the definition of what a rule *is*,
 * and it has to be readable by a contributor who has never seen the project.
 * It knows nothing about YAML, the filesystem, or how a rule is executed — it
 * validates a plain object and a string of prose, and reports issues by path.
 * `scripts/rules-source.ts` is the part that owns `yaml` and turns a path into
 * a `file:line:col`.
 *
 * Why not zod: the schema is ~17 fields of enums, strings and string arrays.
 * A hand-rolled validator says "unknown severity \"warning\" (expected harmful,
 * deprecated, unnecessary)" where a generic one says "invalid enum value", and
 * it keeps `scripts/` free of runtime dependencies.
 */

// --- vocabulary -------------------------------------------------------------
// Every list below is closed. Adding a value is a deliberate one-line change
// with a reviewer attached, which is the point: an open vocabulary drifts into
// forty near-synonyms and the tag index stops being useful.

export const STATUS = ["avoid", "recommended", "situational"] as const;
export const SEVERITY = ["harmful", "deprecated", "unnecessary"] as const;
export const STANDARDS_BASIS = [
  "spec",
  "spec-obsolete",
  "browser-convention",
  "vendor",
  "community",
] as const;
export const DETECTABILITY = ["yes", "partial", "no"] as const;
export const KIND = ["element", "document"] as const;
export const SCOPE = ["head", "body", "any"] as const;
export const FIX_OP = ["remove-element", "remove-attribute", "none"] as const;
export const IMPACTS = [
  "performance",
  "interop",
  "a11y",
  "seo",
  "security",
  "maintainability",
] as const;

/**
 * Tags are for browsing the rule index, not for driving behaviour. Kept
 * deliberately coarse: a tag that applies to exactly one rule is a title, not
 * a tag.
 */
export const TAGS = [
  "a11y",
  "attr",
  "body",
  "charset",
  "favicon",
  "head",
  "i18n",
  "ie",
  "legacy",
  "link",
  "meta",
  "mobile",
  "performance",
  "script",
  "security",
  "seo",
  "social",
  "style",
  "title",
  "viewport",
] as const;

export type Status = (typeof STATUS)[number];
export type Severity = (typeof SEVERITY)[number];
export type StandardsBasis = (typeof STANDARDS_BASIS)[number];
export type Detectability = (typeof DETECTABILITY)[number];
export type Kind = (typeof KIND)[number];
export type Scope = (typeof SCOPE)[number];
export type FixOp = (typeof FIX_OP)[number];
export type Impact = (typeof IMPACTS)[number];
export type Tag = (typeof TAGS)[number];

/**
 * Normalised rule metadata. Optional frontmatter fields are widened to `null`
 * rather than left absent so that `rules.json` has one stable shape and
 * consumers never branch on key presence.
 */
export type RuleMeta = {
  ruleId: string;
  title: string;
  description: string;
  pubDate: string;
  status: Status;
  severity: Severity;
  standardsBasis: StandardsBasis;
  detectability: Detectability;
  kind: Kind;
  scope: Scope;
  selector: string | null;
  match: "logic" | null;
  fix: { op: FixOp };
  replacement: string;
  tags: Tag[];
  impacts: Impact[];
  related: string[];
};

/** Field order in `rules.json`. Fixed so the generated file diffs cleanly. */
export const META_KEYS = [
  "ruleId",
  "title",
  "description",
  "pubDate",
  "status",
  "severity",
  "standardsBasis",
  "detectability",
  "kind",
  "scope",
  "selector",
  "match",
  "fix",
  "replacement",
  "tags",
  "impacts",
  "related",
] as const;

/** Fields a rule cannot omit. Mirrors the required inputs on the issue form. */
export const REQUIRED = [
  "ruleId",
  "title",
  "description",
  "pubDate",
  "status",
  "severity",
  "standardsBasis",
  "detectability",
  "kind",
  "scope",
  "fix",
  "replacement",
] as const;

/**
 * A field issue points at a frontmatter path (`["fix", "op"]`), which the
 * caller resolves to a line via the YAML document AST. A prose issue already
 * knows its absolute offset into the source file, because prose is validated
 * as text.
 */
export type Issue =
  | { kind: "field"; path: (string | number)[]; message: string }
  | { kind: "prose"; offset: number; message: string };

const field = (path: (string | number)[], message: string): Issue => ({
  kind: "field",
  path,
  message,
});

// --- frontmatter fence ------------------------------------------------------

export type Split =
  | {
      ok: true;
      frontmatter: string;
      frontmatterStart: number;
      body: string;
      bodyStart: number;
    }
  | { ok: false; offset: number; message: string };

const FENCE = "---\n";

/**
 * Split the leading `---` fence by hand. `gray-matter` is the usual answer and
 * is rejected here: unmaintained since 2019, and it evals frontmatter through
 * an outdated `js-yaml`. This is the whole of what it was doing for us.
 */
export function splitFrontmatter(source: string): Split {
  const text = source.startsWith("﻿") ? source.slice(1) : source;
  const offset = source.length - text.length; // 0, or 1 when a BOM was stripped

  if (!text.startsWith(FENCE)) {
    return {
      ok: false,
      offset,
      message: "file must start with a `---` frontmatter fence",
    };
  }

  const open = FENCE.length;
  // The closing fence is a line that is exactly `---`, which is also how YAML
  // spells a document separator — so scan line-wise rather than with indexOf.
  let cursor = open;
  while (cursor <= text.length) {
    let eol = text.indexOf("\n", cursor);
    if (eol === -1) eol = text.length;
    const line = text.slice(cursor, eol);
    if (line === "---") {
      return {
        ok: true,
        frontmatter: text.slice(open, cursor),
        frontmatterStart: offset + open,
        body: text.slice(Math.min(eol + 1, text.length)),
        bodyStart: offset + Math.min(eol + 1, text.length),
      };
    }
    if (eol === text.length) break;
    cursor = eol + 1;
  }

  return {
    ok: false,
    offset,
    message: "frontmatter fence is never closed (expected a line containing only `---`)",
  };
}

// --- selector subset --------------------------------------------------------

export type AttrOp = "exists" | "=" | "~=" | "^=" | "$=" | "*=";

export type AttrSel = {
  type: "attr";
  name: string;
  op: AttrOp;
  value: string | null;
  insensitive: boolean;
};
export type TagSel = { type: "tag"; name: string };
export type NotSel = { type: "not"; inner: (TagSel | AttrSel)[] };
export type Simple = TagSel | AttrSel | NotSel;
/** One comma-separated alternative: a compound of simple selectors, no combinators. */
export type Compound = Simple[];

export type SelectorParse =
  | { ok: true; ast: Compound[] }
  | { ok: false; index: number; message: string };

const IDENT = /[a-zA-Z_-][a-zA-Z0-9_-]*/y;
const TAG = /[a-z][a-z0-9-]*/y;
const VALUE = /[a-zA-Z0-9_-]+/y;

/**
 * Parse the supported selector subset: tag names, `[attr]` with `=`, `~=`,
 * `^=`, `$=`, `*=`, the case-insensitive `i` flag, `:not(...)` wrapping those,
 * and comma-separated lists.
 *
 * Everything else is rejected, and the rejection is the feature. The browser
 * adapter hands this string straight to `querySelectorAll`, so the subset is
 * the intersection of "what CSS can do" and "what a fifty-line matcher in core
 * can do against the element port". A rule that needs a combinator is a
 * `kind: "document"` rule.
 */
export function parseSelector(input: string): SelectorParse {
  let i = 0;
  const fail = (index: number, message: string): SelectorParse => ({
    ok: false,
    index,
    message,
  });

  const ws = (): boolean => {
    const from = i;
    while (i < input.length && /\s/.test(input[i] as string)) i++;
    return i > from;
  };

  const match = (re: RegExp): string | null => {
    re.lastIndex = i;
    const m = re.exec(input);
    if (!m) return null;
    i = re.lastIndex;
    return m[0];
  };

  /** `[name]`, `[name op value]`, `[name op value i]`. Cursor is on `[`. */
  const attr = (): AttrSel | SelectorParse => {
    const open = i;
    i++; // `[`
    ws();
    const name = match(IDENT);
    if (name === null) {
      return fail(i, "expected an attribute name after `[`");
    }
    ws();
    if (input[i] === "]") {
      i++;
      return { type: "attr", name, op: "exists", value: null, insensitive: false };
    }
    if (input[i] === "|" && input[i + 1] === "=") {
      return fail(i, "the `|=` attribute operator is not supported");
    }
    let op: AttrOp | null = null;
    const two = input.slice(i, i + 2);
    if (two === "~=" || two === "^=" || two === "$=" || two === "*=") {
      op = two;
      i += 2;
    } else if (input[i] === "=") {
      op = "=";
      i += 1;
    } else {
      return fail(
        i,
        `expected \`]\` or an operator (=, ~=, ^=, $=, *=) in the attribute selector opened at ${open}`,
      );
    }
    ws();
    let value: string | null = null;
    const quote = input[i];
    if (quote === '"' || quote === "'") {
      const end = input.indexOf(quote, i + 1);
      if (end === -1) return fail(i, "unterminated quoted attribute value");
      value = input.slice(i + 1, end);
      i = end + 1;
    } else {
      value = match(VALUE);
      if (value === null) {
        return fail(i, "expected an attribute value (quote it if it contains punctuation)");
      }
    }
    ws();
    let insensitive = false;
    const flag = input[i];
    if (flag !== undefined && /[a-zA-Z]/.test(flag)) {
      if (flag !== "i" && flag !== "I") {
        return fail(i, `unsupported attribute flag \`${flag}\` (only the \`i\` flag is supported)`);
      }
      insensitive = true;
      i++;
      ws();
    }
    if (input[i] !== "]") {
      return fail(i, "expected `]` to close the attribute selector");
    }
    i++;
    return { type: "attr", name, op, value, insensitive };
  };

  /** A tag name and/or a run of attribute selectors, with no whitespace inside. */
  const compound = (inNot: boolean): Compound | SelectorParse => {
    const parts: Simple[] = [];
    const start = i;

    const tag = match(TAG);
    if (tag !== null) parts.push({ type: "tag", name: tag });

    for (;;) {
      const ch = input[i];
      if (ch === "[") {
        const a = attr();
        if (!("type" in a)) return a;
        parts.push(a);
        continue;
      }
      if (ch === ":") {
        if (inNot) {
          return fail(i, "`:not(...)` cannot be nested");
        }
        if (!input.startsWith(":not(", i)) {
          const name = /[a-zA-Z-]*/y;
          name.lastIndex = i + 1;
          const pseudo = name.exec(input)?.[0] ?? "";
          return fail(
            i,
            `pseudo-class \`:${pseudo}\` is not supported; only \`:not(...)\` is`,
          );
        }
        i += ":not(".length;
        ws();
        const inner = compound(true);
        if (!Array.isArray(inner)) return inner;
        ws();
        if (input[i] === ",") {
          return fail(i, "`:not(...)` does not take a selector list");
        }
        if (input[i] !== ")") return fail(i, "expected `)` to close `:not(`");
        i++;
        parts.push({ type: "not", inner: inner as (TagSel | AttrSel)[] });
        continue;
      }
      break;
    }

    if (parts.length === 0) {
      const ch = input[i];
      if (ch === "*") {
        return fail(i, "the universal selector `*` is not supported");
      }
      if (ch === "." || ch === "#") {
        return fail(
          i,
          `\`${ch}\` selectors are not supported; use [class~=name] or [id=name]`,
        );
      }
      if (ch !== undefined && /[A-Z]/.test(ch)) {
        return fail(i, "tag names must be lowercase");
      }
      return fail(start, ch === undefined ? "unexpected end of selector" : `unexpected \`${ch}\``);
    }
    return parts;
  };

  const ast: Compound[] = [];
  ws();
  if (i >= input.length) return fail(0, "selector is empty");

  for (;;) {
    const c = compound(false);
    if (!Array.isArray(c)) return c;
    ast.push(c);

    const before = i;
    const hadSpace = ws();
    if (i >= input.length) break;
    if (input[i] === ",") {
      i++;
      ws();
      if (i >= input.length) return fail(i, "trailing `,` in selector list");
      continue;
    }
    const ch = input[i] as string;
    if (ch === ">" || ch === "+" || ch === "~") {
      return fail(i, `combinators are not supported (found \`${ch}\`)`);
    }
    if (ch === "*" && !hadSpace) {
      return fail(i, "the universal selector `*` is not supported");
    }
    if (hadSpace) {
      return fail(before, "combinators are not supported (found a descendant space)");
    }
    return fail(i, `unexpected \`${ch}\``);
  }

  return { ok: true, ast };
}

// --- frontmatter ------------------------------------------------------------

export const RULE_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\/[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  path: (string | number)[],
  issues: Issue[],
): T | null {
  if (value === undefined) return null; // already reported as missing
  if (typeof value !== "string") {
    issues.push(field(path, `must be a string (one of: ${allowed.join(", ")})`));
    return null;
  }
  if (!(allowed as readonly string[]).includes(value)) {
    issues.push(field(path, `unknown value \`${value}\` (expected one of: ${allowed.join(", ")})`));
    return null;
  }
  return value as T;
}

function nonEmptyString(
  value: unknown,
  path: (string | number)[],
  issues: Issue[],
): string | null {
  if (value === undefined) return null; // already reported as missing
  if (typeof value !== "string") {
    issues.push(field(path, "must be a string"));
    return null;
  }
  if (value.trim() === "") {
    issues.push(field(path, "must not be empty"));
    return null;
  }
  return value;
}

/** Shared shape for `tags`, `impacts` and `related`: an optional list of strings. */
function stringList(
  value: unknown,
  path: (string | number)[],
  issues: Issue[],
): string[] | null {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    issues.push(field(path, "must be a list"));
    return null;
  }
  const out: string[] = [];
  for (let n = 0; n < value.length; n++) {
    const item: unknown = value[n];
    if (typeof item !== "string") {
      issues.push(field([...path, n], "must be a string"));
      continue;
    }
    out.push(item);
  }
  return out;
}

export type FrontmatterResult =
  | { ok: true; meta: RuleMeta }
  | { ok: false; issues: Issue[] };

/**
 * Validate parsed frontmatter. Takes a plain object so this stays independent
 * of the YAML library; the caller maps `issue.path` back to a line.
 */
export function validateFrontmatter(data: unknown): FrontmatterResult {
  const issues: Issue[] = [];

  if (!isPlainObject(data)) {
    return { ok: false, issues: [field([], "frontmatter must be a mapping of fields")] };
  }

  const known = new Set<string>(META_KEYS);
  for (const key of Object.keys(data)) {
    if (!known.has(key)) {
      issues.push(
        field([key], `unknown frontmatter field \`${key}\` (known: ${META_KEYS.join(", ")})`),
      );
    }
  }

  for (const key of REQUIRED) {
    if (data[key] === undefined || data[key] === null) {
      issues.push(field([key], "is required"));
    }
  }

  const ruleId = nonEmptyString(data["ruleId"], ["ruleId"], issues);
  if (ruleId !== null && !RULE_ID.test(ruleId)) {
    issues.push(
      field(
        ["ruleId"],
        `\`${ruleId}\` is not a valid ruleId (expected lowercase \`namespace/name\`, e.g. meta/viewport)`,
      ),
    );
  }

  const title = nonEmptyString(data["title"], ["title"], issues);
  const description = nonEmptyString(data["description"], ["description"], issues);
  const replacement = nonEmptyString(data["replacement"], ["replacement"], issues);

  const pubDateRaw: unknown = data["pubDate"];
  let pubDate: string | null = null;
  if (pubDateRaw === undefined || pubDateRaw === null) {
    // already reported as missing
  } else if (typeof pubDateRaw !== "string") {
    issues.push(
      field(["pubDate"], 'must be a quoted ISO date string, e.g. "2026-07-12"'),
    );
  } else {
    const m = ISO_DATE.exec(pubDateRaw);
    if (!m) {
      issues.push(field(["pubDate"], `\`${pubDateRaw}\` is not an ISO date (YYYY-MM-DD)`));
    } else {
      // Round-trip so 2026-02-30 and 2026-13-01 are rejected, not silently rolled over.
      const iso = new Date(`${pubDateRaw}T00:00:00Z`);
      if (Number.isNaN(iso.getTime()) || iso.toISOString().slice(0, 10) !== pubDateRaw) {
        issues.push(field(["pubDate"], `\`${pubDateRaw}\` is not a real calendar date`));
      } else {
        pubDate = pubDateRaw;
      }
    }
  }

  const status = oneOf(data["status"], STATUS, ["status"], issues);
  const severity = oneOf(data["severity"], SEVERITY, ["severity"], issues);
  const standardsBasis = oneOf(
    data["standardsBasis"],
    STANDARDS_BASIS,
    ["standardsBasis"],
    issues,
  );
  const detectability = oneOf(data["detectability"], DETECTABILITY, ["detectability"], issues);
  const kind = oneOf(data["kind"], KIND, ["kind"], issues);
  const scope = oneOf(data["scope"], SCOPE, ["scope"], issues);

  const selectorRaw: unknown = data["selector"];
  let selector: string | null = null;
  if (selectorRaw !== undefined && selectorRaw !== null) {
    if (typeof selectorRaw !== "string" || selectorRaw.trim() === "") {
      issues.push(field(["selector"], "must be a non-empty string, or omitted"));
    } else {
      const parsed = parseSelector(selectorRaw);
      if (!parsed.ok) {
        issues.push(
          field(["selector"], `unsupported selector at offset ${parsed.index}: ${parsed.message}`),
        );
      } else {
        selector = selectorRaw;
      }
    }
  }

  const matchRaw: unknown = data["match"];
  let match: "logic" | null = null;
  if (matchRaw !== undefined && matchRaw !== null) {
    if (matchRaw !== "logic") {
      issues.push(field(["match"], 'the only supported value is "logic"'));
    } else {
      match = "logic";
    }
  }

  // An element rule is matched by its selector; if the selector subset cannot
  // express the match, the rule is a `kind: "document"` rule with a logic
  // module. `match: "logic"` refines a selector, it does not replace one.
  if (kind === "element" && selectorRaw === undefined) {
    issues.push(
      field(
        ["selector"],
        'required for `kind: "element"` (a rule the selector subset cannot express is `kind: "document"`)',
      ),
    );
  }
  if (kind === "document" && match === null) {
    issues.push(
      field(["match"], '`kind: "document"` rules are decided by code; set `match: "logic"`'),
    );
  }

  const fixRaw: unknown = data["fix"];
  let fixOp: FixOp | null = null;
  if (fixRaw === undefined || fixRaw === null) {
    // already reported as missing
  } else if (!isPlainObject(fixRaw)) {
    issues.push(field(["fix"], "must be a mapping, e.g. `fix: { op: remove-element }`"));
  } else {
    for (const key of Object.keys(fixRaw)) {
      if (key !== "op") issues.push(field(["fix", key], `unknown fix field \`${key}\``));
    }
    fixOp = oneOf(fixRaw["op"], FIX_OP, ["fix", "op"], issues);
  }

  const tagsRaw = stringList(data["tags"], ["tags"], issues);
  const tags: Tag[] = [];
  if (tagsRaw) {
    for (let n = 0; n < tagsRaw.length; n++) {
      const t = oneOf(tagsRaw[n], TAGS, ["tags", n], issues);
      if (t !== null) tags.push(t);
    }
  }

  const impactsRaw = stringList(data["impacts"], ["impacts"], issues);
  const impacts: Impact[] = [];
  if (impactsRaw) {
    for (let n = 0; n < impactsRaw.length; n++) {
      const im = oneOf(impactsRaw[n], IMPACTS, ["impacts", n], issues);
      if (im !== null) impacts.push(im);
    }
  }

  // Shape only. Cross-rule existence is deliberately not enforced while the
  // rule set is bootstrapping — a rule may legitimately point at one that has
  // not been written yet.
  const relatedRaw = stringList(data["related"], ["related"], issues);
  const related: string[] = [];
  if (relatedRaw) {
    for (let n = 0; n < relatedRaw.length; n++) {
      const r = relatedRaw[n] as string;
      if (!RULE_ID.test(r)) {
        issues.push(field(["related", n], `\`${r}\` is not a valid ruleId`));
      } else {
        related.push(r);
      }
    }
  }

  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    meta: {
      ruleId: ruleId as string,
      title: title as string,
      description: description as string,
      pubDate: pubDate as string,
      status: status as Status,
      severity: severity as Severity,
      standardsBasis: standardsBasis as StandardsBasis,
      detectability: detectability as Detectability,
      kind: kind as Kind,
      scope: scope as Scope,
      selector,
      match,
      fix: { op: fixOp as FixOp },
      replacement: replacement as string,
      tags,
      impacts,
      related,
    },
  };
}

// --- prose ------------------------------------------------------------------

/** The `##` sections every rule doc carries, in this order, after an intro. */
export const SECTIONS = ["Use instead", "Detectability", "Resources"] as const;

/** `## Why avoid` for a rule you should not use, `## Why use` for one you should. */
export function whyHeadings(status: Status): string[] {
  if (status === "recommended") return ["Why use"];
  if (status === "avoid") return ["Why avoid"];
  return ["Why avoid", "Why use"]; // situational: the doc picks the honest framing
}

type Heading = { depth: number; text: string; offset: number };

/**
 * Collect ATX headings, ignoring anything inside a fenced code block — rule
 * docs quote markup, and a fenced example containing `## ` is not a section.
 */
function headings(body: string): Heading[] {
  const out: Heading[] = [];
  let fence: string | null = null;
  let offset = 0;

  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    const open = /^(`{3,}|~{3,})/.exec(trimmed);
    if (fence !== null) {
      if (open && trimmed.startsWith(fence) && trimmed.replace(/[`~]/g, "") === "") fence = null;
    } else if (open) {
      fence = open[1] as string;
    } else {
      const m = /^(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/.exec(line);
      if (m) {
        out.push({ depth: (m[1] as string).length, text: m[2] as string, offset });
      }
    }
    offset += line.length + 1;
  }
  return out;
}

const LIST_ITEM = /^ {0,3}(?:[-*+]|\d+[.)])[ \t]+\S/;

/**
 * Validate the prose contract: an intro paragraph, then exactly
 * `## Why avoid` (or `## Why use`), `## Use instead`, `## Detectability`,
 * `## Resources`, in that order, with at least two entries under Resources.
 *
 * Offsets are absolute into the source file so the caller can turn them into
 * `file:line:col` without re-deriving where the body started.
 */
export function validateProse(body: string, bodyStart: number, status: Status | null): Issue[] {
  const issues: Issue[] = [];
  const prose = (offset: number, message: string): Issue => ({
    kind: "prose",
    offset: bodyStart + offset,
    message,
  });

  const all = headings(body);
  const sections = all.filter((h) => h.depth === 2);
  const why = whyHeadings(status ?? "avoid");
  const expected = [why.length === 1 ? (why[0] as string) : "Why avoid` or `## Why use", ...SECTIONS];

  const firstHeading = all[0];
  const intro = body.slice(0, firstHeading?.offset ?? body.length);
  if (intro.trim() === "") {
    issues.push(
      prose(0, "needs an intro paragraph before the first heading: what the thing is and where it came from"),
    );
  }

  for (let n = 0; n < expected.length; n++) {
    const want = expected[n] as string;
    const got = sections[n];
    if (got === undefined) {
      issues.push(prose(body.length, `missing \`## ${want}\` section`));
      continue;
    }
    const ok = n === 0 ? why.includes(got.text) : got.text === want;
    if (!ok) {
      issues.push(
        prose(got.offset, `expected \`## ${want}\` here, found \`## ${got.text}\``),
      );
    }
  }
  for (let n = expected.length; n < sections.length; n++) {
    const extra = sections[n] as Heading;
    issues.push(prose(extra.offset, `unexpected \`## ${extra.text}\` section`));
  }

  const resources = sections.find((h) => h.text === "Resources");
  if (resources) {
    const after = sections.find((h) => h.offset > resources.offset);
    const block = body.slice(resources.offset, after?.offset ?? body.length);
    const count = block.split("\n").slice(1).filter((l) => LIST_ITEM.test(l)).length;
    if (count < 2) {
      issues.push(
        prose(
          resources.offset,
          `needs at least two independent sources, found ${count}. One blog post is not evidence.`,
        ),
      );
    }
  }

  return issues;
}

// --- positions --------------------------------------------------------------

/** 1-based line/col for an absolute offset, for `file:line:col` diagnostics. */
export function offsetToLineCol(source: string, offset: number): { line: number; col: number } {
  const clamped = Math.max(0, Math.min(offset, source.length));
  let line = 1;
  let lineStart = 0;
  for (let i = 0; i < clamped; i++) {
    if (source[i] === "\n") {
      line++;
      lineStart = i + 1;
    }
  }
  return { line, col: clamped - lineStart + 1 };
}
