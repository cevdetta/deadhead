/**
 * Dispatch rules over a parsed document.
 *
 * The shape that matters: rules are bucketed by the leading tag name of their
 * selector once, at load time, and each node is tested against its own bucket
 * plus a small wildcard bucket. Iterating every rule for every node is the
 * obvious implementation and it is quadratic in the thing that grows —
 * the rule set.
 */

import { type Compound, leadingTag, matches, parseSelector } from "./selector.ts";
import { NO_SUPPRESSIONS, type Suppressions } from "./suppressions.ts";
import { walk } from "./walker.ts";
import type {
  CheckFn,
  ElementPort,
  Finding,
  MatchFn,
  Parsed,
  RuleContext,
} from "./types.ts";
import { type RuleMeta, ruleUrl } from "./vocabulary.ts";

/** A rule as the engine consumes it: metadata plus whatever code it needs. */
export type Rule = {
  meta: RuleMeta;
  /** Required when `meta.kind === "element"` and `meta.match === "logic"`. */
  match?: MatchFn;
  /** Required when `meta.kind === "document"`. */
  check?: CheckFn;
};

type Compiled = Rule & { parsed: Compound[] | null };

export type RunOptions = {
  suppressions?: Suppressions;
  skipTemplates?: boolean;
};

const MAX_SNIPPET = 90;

/**
 * The source text of the element, truncated. Falls back to rebuilding an open
 * tag from the port when there is no source — the DOM adapter — so a finding
 * always names something the reader can recognise.
 */
function snippet(element: ElementPort, source: string | null): string {
  const range = element.range();
  let text: string;
  if (source !== null && range !== null) {
    text = source.slice(range[0], range[1]);
  } else {
    const attrs = element
      .attrNames()
      .map((name) => ` ${name}="${element.attr(name) ?? ""}"`)
      .join("");
    text = `<${element.tag}${attrs}>`;
  }
  text = text.replace(/\s+/g, " ").trim();
  return text.length > MAX_SNIPPET ? `${text.slice(0, MAX_SNIPPET - 1)}…` : text;
}

function contextFor(rule: Rule, source: string | null): RuleContext {
  const { meta } = rule;
  return {
    ruleId: meta.ruleId,
    report(element, extra) {
      const finding: Finding = {
        ruleId: meta.ruleId,
        severity: meta.severity,
        // `partial` detectability means the rule cannot be sure. It is reported
        // as "possible" and, in M4, never autofixed.
        possible: meta.detectability === "partial",
        message: meta.description,
        replacement: meta.replacement,
        url: ruleUrl(meta.ruleId),
        loc: element.loc(),
        range: element.range(),
        node: { tag: element.tag, snippet: snippet(element, source) },
      };
      // exactOptionalPropertyTypes: assign `detail` only when there is one.
      if (extra?.detail !== undefined) finding.detail = extra.detail;
      return finding;
    },
  };
}

/**
 * Parse each selector once and sort rules into dispatch buckets.
 *
 * A selector that fails to parse here is a build failure that escaped
 * `validate-rules`, not user input, so it throws rather than degrading.
 */
export function compile(rules: Rule[]): {
  byTag: Map<string, Compiled[]>;
  wildcard: Compiled[];
  documents: Compiled[];
  visitBody: boolean;
} {
  const byTag = new Map<string, Compiled[]>();
  const wildcard: Compiled[] = [];
  const documents: Compiled[] = [];
  let visitBody = false;

  for (const rule of rules) {
    let parsed: Compound[] | null = null;
    if (rule.meta.selector !== null) {
      const result = parseSelector(rule.meta.selector);
      if (!result.ok) {
        throw new Error(
          `${rule.meta.ruleId}: unsupported selector ${JSON.stringify(rule.meta.selector)} — ${result.message}`,
        );
      }
      parsed = result.ast;
    }
    const compiled: Compiled = { ...rule, parsed };

    if (rule.meta.kind === "document") {
      documents.push(compiled);
      continue;
    }
    if (rule.meta.scope !== "head") visitBody = true;

    const tag = parsed === null ? null : leadingTag(parsed);
    if (tag === null) {
      wildcard.push(compiled);
    } else {
      const bucket = byTag.get(tag);
      if (bucket) bucket.push(compiled);
      else byTag.set(tag, [compiled]);
    }
  }

  return { byTag, wildcard, documents, visitBody };
}

/**
 * Sort key. Source offset is the real ordering; line/col is the fallback for
 * adapters that have no offsets, and breaks ties when nothing else can.
 */
const positionOf = (finding: Finding): [number, number, number] => [
  finding.range?.[0] ?? Number.MAX_SAFE_INTEGER,
  finding.loc?.line ?? 0,
  finding.loc?.col ?? 0,
];

export function run(rules: Rule[], parsed: Parsed, options: RunOptions = {}): Finding[] {
  const { byTag, wildcard, documents, visitBody } = compile(rules);
  const suppressions = options.suppressions ?? NO_SUPPRESSIONS;
  const findings: Finding[] = [];

  // Document rules first: they query the whole tree rather than riding the walk.
  for (const rule of documents) {
    if (!rule.check) {
      throw new Error(`${rule.meta.ruleId}: kind "document" requires a check() logic module`);
    }
    findings.push(...rule.check(parsed.doc, contextFor(rule, parsed.source)));
  }

  const contexts = new Map<string, RuleContext>();
  const contextOf = (rule: Rule): RuleContext => {
    let ctx = contexts.get(rule.meta.ruleId);
    if (!ctx) {
      ctx = contextFor(rule, parsed.source);
      contexts.set(rule.meta.ruleId, ctx);
    }
    return ctx;
  };

  const walkOptions: { visitBody: boolean; skipTemplates?: boolean } = { visitBody };
  if (options.skipTemplates !== undefined) walkOptions.skipTemplates = options.skipTemplates;

  walk(
    parsed.root,
    (element, region) => {
      const consider = (rule: Compiled): void => {
        const scope = rule.meta.scope;
        if (scope === "head" && region !== "head") return;
        if (scope === "body" && region !== "body") return;
        if (rule.parsed !== null && !matches(element, rule.parsed)) return;

        const ctx = contextOf(rule);
        if (rule.meta.match === "logic") {
          if (!rule.match) {
            throw new Error(`${rule.meta.ruleId}: match "logic" requires a match() logic module`);
          }
          if (!rule.match(element, ctx)) return;
        }
        findings.push(ctx.report(element));
      };

      // Two loops rather than a concatenation: this runs once per node, and
      // building a throwaway array per node is the allocation that shows up.
      const bucket = byTag.get(element.tag);
      if (bucket !== undefined) for (const rule of bucket) consider(rule);
      for (const rule of wildcard) consider(rule);
    },
    walkOptions,
  );

  return dedupe(findings, suppressions);
}

function dedupe(findings: Finding[], suppressions: Suppressions): Finding[] {
  const seen = new Set<string>();
  const kept: Finding[] = [];

  for (const finding of findings) {
    if (suppressions.isSuppressed(finding.ruleId, finding.loc?.line ?? null)) continue;
    const key =
      finding.range !== null
        ? `${finding.ruleId}:${finding.range[0]}`
        : finding.loc !== null
          ? `${finding.ruleId}:${finding.loc.line}:${finding.loc.col}`
          : null;
    if (key !== null) {
      if (seen.has(key)) continue;
      seen.add(key);
    }
    kept.push(finding);
  }

  return kept.sort((a, b) => {
    const [ao, al, ac] = positionOf(a);
    const [bo, bl, bc] = positionOf(b);
    return ao - bo || al - bl || ac - bc || a.ruleId.localeCompare(b.ruleId);
  });
}
