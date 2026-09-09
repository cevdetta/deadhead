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

import {
  DETECTABILITY,
  FIX_OP,
  IMPACTS,
  KIND,
  SCOPE,
  SEVERITY,
  STANDARDS_BASIS,
  STATUS,
  TAGS,
  type Detectability,
  type FixOp,
  type Impact,
  type Kind,
  type RuleMeta,
  type Scope,
  type Severity,
  type StandardsBasis,
  type Status,
  type Tag,
} from "../packages/core/vocabulary.ts";
import { parseSelector } from "../packages/core/selector.ts";

// The vocabulary and the selector grammar live in core because the engine
// needs them too, and a validator that disagrees with the engine is worse
// than no validator: it green-lights rules that silently match nothing.
export type { RuleMeta, Status, Severity, Kind, Scope };

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
