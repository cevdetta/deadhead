/**
 * Fixes are text edits over byte ranges of the original source. Nothing here
 * ever touches the tree.
 *
 * That is not a stylistic preference. Serialising a parsed document back to
 * HTML rewrites quote style, attribute order, whitespace, void-element
 * spelling and character references across the *entire* file — so a one-line
 * fix arrives as a thousand-line diff, and the tool becomes unusable on any
 * codebase with review. Range edits also make ESLint autofix free, because an
 * ESLint fixer is exactly a range and a replacement string.
 */

import type { ElementPort, Range } from "./types.ts";
import type { RuleMeta } from "./vocabulary.ts";

export type Fix = { ruleId: string; range: Range; text: string };

const isBlank = (value: string): boolean => /^[ \t]*$/.test(value);

/**
 * Widen an element's range to swallow the whole line when the element sits on
 * one by itself. Without this, deleting `<meta …>` leaves the indentation and
 * the newline behind, and the fix that was supposed to tidy the file adds a
 * blank line to it.
 */
function wholeLineIfAlone(source: string, [start, end]: Range): Range {
  const lineStart = source.lastIndexOf("\n", start - 1) + 1;
  if (!isBlank(source.slice(lineStart, start))) return [start, end];

  let after = end;
  while (after < source.length && (source[after] === " " || source[after] === "\t")) after++;
  if (after < source.length && source[after] !== "\n") return [start, end];

  return [lineStart, after < source.length ? after + 1 : after];
}

/** Take the whitespace before an attribute with it, so `<a  b>` never appears. */
function withLeadingSpace(source: string, [start, end]: Range): Range {
  let from = start;
  while (from > 0 && (source[from - 1] === " " || source[from - 1] === "\t")) from--;
  return [from, end];
}

/**
 * The fix for one finding, or `null` when there is not one.
 *
 * Four reasons there may be no fix, all of them deliberate:
 * - the rule declares `fix: { op: "none" }`;
 * - `detectability: "partial"`, so the rule is not certain and must never edit
 *   somebody's file on a guess;
 * - the adapter has no source text (the live DOM), so there is no range;
 * - the attribute the rule names is not actually on this element.
 */
export function computeFix(
  meta: RuleMeta,
  element: ElementPort,
  source: string | null,
): Fix | null {
  if (meta.fix.op === "none") return null;
  // "Possible" findings are reported and never autofixed.
  if (meta.detectability === "partial") return null;
  if (source === null) return null;

  if (meta.fix.op === "remove-element") {
    const range = element.range();
    if (range === null) return null;
    return { ruleId: meta.ruleId, range: wholeLineIfAlone(source, range), text: "" };
  }

  const attr = meta.fix.attr;
  if (attr === null) return null;
  const range = element.attrRange(attr);
  if (range === null) return null;
  return { ruleId: meta.ruleId, range: withLeadingSpace(source, range), text: "" };
}

export type ApplyResult = {
  output: string;
  applied: Fix[];
  /** Fixes dropped because they overlapped one already applied. */
  skipped: Fix[];
};

/**
 * Splice fixes into the original source.
 *
 * Applied back to front so earlier offsets stay valid, and any fix overlapping
 * one already applied is skipped rather than merged: two rules disagreeing
 * about the same bytes is a conflict, and guessing at a resolution would
 * corrupt the file. The caller re-runs to pick up what was skipped, the way
 * ESLint does.
 */
export function applyFixes(source: string, fixes: Fix[]): ApplyResult {
  const ordered = [...fixes].sort((a, b) => b.range[0] - a.range[0] || b.range[1] - a.range[1]);

  const applied: Fix[] = [];
  const skipped: Fix[] = [];
  let output = source;
  let lastStart = Number.POSITIVE_INFINITY;

  for (const fix of ordered) {
    const [start, end] = fix.range;
    if (end > lastStart) {
      skipped.push(fix);
      continue;
    }
    output = output.slice(0, start) + fix.text + output.slice(end);
    applied.push(fix);
    lastStart = start;
  }

  return { output, applied: applied.reverse(), skipped: skipped.reverse() };
}
