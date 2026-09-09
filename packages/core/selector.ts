/**
 * The selector subset: parser and matcher.
 *
 * Both halves live together on purpose. The parser is what `validate-rules`
 * uses to reject an unsupported selector at contribution time; the matcher is
 * what the engine uses to evaluate the survivors. If they lived apart they
 * would drift, and the failure mode is silent — a rule that validates in CI
 * and then matches nothing.
 *
 * The subset is the intersection of what CSS can express, what
 * `querySelectorAll` will accept verbatim in the browser adapter, and what a
 * small matcher can evaluate against the element port. Anything outside it is
 * a `kind: "document"` rule.
 */

import type { ElementPort } from "./types.ts";

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

// --- matching ---------------------------------------------------------------

/**
 * ASCII lowercase, which is what CSS means by case-insensitive. `toLowerCase`
 * is Unicode-aware and would fold characters the spec leaves alone.
 */
const asciiLower = (value: string): string =>
  value.replace(/[A-Z]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 32));

/** ASCII whitespace, the separator `~=` splits on. */
const SPACE = /[\t\n\f\r ]+/;

function matchesAttr(element: ElementPort, sel: AttrSel): boolean {
  const raw = element.attr(sel.name);
  if (raw === undefined) return false;
  if (sel.op === "exists") return true;

  const actual = sel.insensitive ? asciiLower(raw) : raw;
  const expected = sel.insensitive ? asciiLower(sel.value ?? "") : (sel.value ?? "");

  switch (sel.op) {
    case "=":
      return actual === expected;
    // Per CSS Selectors: an empty value never matches for the substring and
    // whitespace-list operators. Without this, `[rel~=""]` would match anything.
    case "~=":
      return expected !== "" && !SPACE.test(expected) && actual.split(SPACE).includes(expected);
    case "^=":
      return expected !== "" && actual.startsWith(expected);
    case "$=":
      return expected !== "" && actual.endsWith(expected);
    case "*=":
      return expected !== "" && actual.includes(expected);
  }
}

function matchesSimple(element: ElementPort, sel: Simple): boolean {
  switch (sel.type) {
    case "tag":
      return element.tag === sel.name;
    case "attr":
      return matchesAttr(element, sel);
    // `:not(a[b])` negates the compound as a whole, not each part of it.
    case "not":
      return !sel.inner.every((inner) => matchesSimple(element, inner));
  }
}

/** Does this element match any alternative in a parsed selector list? */
export function matches(element: ElementPort, list: Compound[]): boolean {
  return list.some((compound) => compound.every((part) => matchesSimple(element, part)));
}

/**
 * The tag bucket this selector can be dispatched from, or `null` for the
 * wildcard bucket.
 *
 * Attribute values are compared case-sensitively unless the selector carries
 * the `i` flag. HTML's own list of legacy case-insensitive attributes is not
 * implemented, so a rule that needs case-insensitive matching must say `i`
 * explicitly — which is also what keeps this matcher and `querySelectorAll`
 * agreeing in the browser adapter.
 */
export function leadingTag(list: Compound[]): string | null {
  let tag: string | null = null;
  for (const compound of list) {
    const first = compound[0];
    if (first === undefined || first.type !== "tag") return null;
    if (tag !== null && tag !== first.name) return null;
    tag = first.name;
  }
  return tag;
}
