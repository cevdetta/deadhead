/**
 * Suppression comments.
 *
 *     <!-- deadhead-disable-next-line meta/http-equiv-x-ua-compatible -->
 *     <!-- deadhead-disable meta/viewport-user-scalable -->
 *     <!-- deadhead-enable -->
 *
 * A bare `deadhead-disable` with no rule id suppresses everything.
 *
 * These are read out of the source text rather than off the tree, because the
 * element port has no comment accessor and adding one would mean extending all
 * three adapters for a feature only two of them can serve. Where there is no
 * source text — the DOM adapter — there are no suppressions, and a finding
 * with no line cannot be suppressed by line.
 */

const COMMENT = /<!--([\s\S]*?)-->/g;
const DIRECTIVE = /^deadhead-(disable-next-line|disable|enable)\b([\s\S]*)$/;

/** Rule ids may be separated by whitespace, commas, or both. */
const parseIds = (rest: string): string[] =>
  rest
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter((id) => id !== "");

type Block = { from: number; to: number; all: boolean; ids: Set<string> };

export type Suppressions = {
  /** A finding with no line (the DOM adapter) can never be suppressed. */
  isSuppressed(ruleId: string, line: number | null): boolean;
};

/** Nothing is suppressed. Used where there is no source text to read. */
export const NO_SUPPRESSIONS: Suppressions = { isSuppressed: () => false };

export function parseSuppressions(source: string): Suppressions {
  const blocks: Block[] = [];
  const nextLine = new Map<number, { all: boolean; ids: Set<string> }>();

  // Open disables, kept separately so a bare `disable` and an id-specific one
  // can overlap without either swallowing the other.
  let openAll: number | null = null;
  const openIds = new Map<string, number>();

  const closeAll = (to: number): void => {
    if (openAll !== null) {
      blocks.push({ from: openAll, to, all: true, ids: new Set() });
      openAll = null;
    }
    for (const [id, from] of openIds) {
      blocks.push({ from, to, all: false, ids: new Set([id]) });
    }
    openIds.clear();
  };

  let line = 1;
  let scanned = 0;

  for (const comment of source.matchAll(COMMENT)) {
    const at = comment.index;
    // Count newlines only once across the whole scan; matches arrive in order.
    for (let i = scanned; i < at; i++) if (source[i] === "\n") line++;
    scanned = at;

    const directive = DIRECTIVE.exec((comment[1] ?? "").trim());
    if (!directive) continue;

    const kind = directive[1] as "disable-next-line" | "disable" | "enable";
    const ids = parseIds(directive[2] ?? "");

    if (kind === "disable-next-line") {
      const target = line + 1;
      const existing = nextLine.get(target) ?? { all: false, ids: new Set<string>() };
      if (ids.length === 0) existing.all = true;
      for (const id of ids) existing.ids.add(id);
      nextLine.set(target, existing);
      continue;
    }

    if (kind === "disable") {
      if (ids.length === 0) openAll ??= line;
      for (const id of ids) if (!openIds.has(id)) openIds.set(id, line);
      continue;
    }

    // `enable` with no ids re-enables everything. With ids it closes only those
    // id-specific blocks; it deliberately does not carve a hole in a bare
    // `deadhead-disable`, which stays off until an unqualified `enable`.
    if (ids.length === 0) {
      closeAll(line);
    } else {
      for (const id of ids) {
        const from = openIds.get(id);
        if (from !== undefined) {
          blocks.push({ from, to: line, all: false, ids: new Set([id]) });
          openIds.delete(id);
        }
      }
    }
  }

  closeAll(Number.POSITIVE_INFINITY);

  return {
    isSuppressed(ruleId, line) {
      if (line === null) return false;
      const exact = nextLine.get(line);
      if (exact && (exact.all || exact.ids.has(ruleId))) return true;
      return blocks.some(
        (b) => line >= b.from && line <= b.to && (b.all || b.ids.has(ruleId)),
      );
    },
  };
}
