/**
 * Reads `content/rules/**\/*.md` and turns it into validated rule metadata.
 *
 * This is the only part of the build that knows about YAML or the filesystem.
 * `scripts/schema.ts` decides what is valid; this decides where the invalid
 * thing is. That split is why `yaml` is worth a dependency here: its document
 * AST carries source ranges, so `validate-rules` can point at the exact bad
 * field instead of saying "somewhere in the frontmatter".
 */

import { readdir, readFile } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";
import { type Document, isMap, isScalar, parseDocument } from "yaml";

import {
  type Issue,
  type RuleMeta,
  offsetToLineCol,
  splitFrontmatter,
  validateFrontmatter,
  validateProse,
} from "./schema.ts";

/** Repo root, derived from this file rather than `cwd` so the scripts run from anywhere. */
export const ROOT = fileURLToPath(new URL("../", import.meta.url));
export const RULES_DIR = resolve(ROOT, "content/rules");
export const LOGIC_DIR = resolve(ROOT, "packages/rules/logic");

export type Diagnostic = { file: string; line: number; col: number; message: string };

export type LoadedRule = {
  /** Repo-relative, forward slashes, for diagnostics and for the ruleId check. */
  file: string;
  meta: RuleMeta;
};

/** Repo-relative path with forward slashes, so messages match on every platform. */
export const rel = (path: string): string => relative(ROOT, path).split(sep).join("/");

const nodeStart = (node: unknown): number | null => {
  if (node !== null && typeof node === "object" && "range" in node) {
    const range: unknown = (node as { range: unknown }).range;
    if (Array.isArray(range) && typeof range[0] === "number") return range[0];
  }
  return null;
};

const getIn = (doc: Document, path: (string | number)[]): unknown => {
  if (path.length === 0) return doc.contents;
  try {
    return doc.getIn(path, true);
  } catch {
    return undefined;
  }
};

/**
 * Best offset for a frontmatter path, walking up until something exists.
 * Prefers the *key* node: "unknown field `sevrity`" should underline the key,
 * and a missing field has no value node to point at at all.
 */
function offsetForPath(doc: Document, path: (string | number)[]): number {
  for (let i = path.length; i >= 0; i--) {
    if (i > 0) {
      const parent = getIn(doc, path.slice(0, i - 1));
      const key = path[i - 1];
      if (isMap(parent)) {
        for (const item of parent.items) {
          if (isScalar(item.key) && item.key.value === key) {
            const start = nodeStart(item.key);
            if (start !== null) return start;
          }
        }
      }
    }
    const start = nodeStart(getIn(doc, path.slice(0, i)));
    if (start !== null) return start;
  }
  return 0;
}

/** Find every `*.md` under `content/rules`, sorted, so output is deterministic. */
export async function findRuleFiles(dir: string = RULES_DIR): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(dir, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  return entries
    .filter((entry) => entry.endsWith(".md"))
    .map((entry) => resolve(dir, entry))
    .sort();
}

/**
 * Validate one markdown file. Returns the metadata, or the diagnostics that
 * stopped it — never both, because a half-validated rule in `rules.json` is
 * worse than no rule.
 */
export function parseRuleFile(
  file: string,
  source: string,
): { rule: LoadedRule | null; diagnostics: Diagnostic[] } {
  const path = rel(file);
  const at = (offset: number, message: string): Diagnostic => ({
    file: path,
    ...offsetToLineCol(source, offset),
    message,
  });

  const split = splitFrontmatter(source);
  if (!split.ok) return { rule: null, diagnostics: [at(split.offset, split.message)] };

  const doc = parseDocument(split.frontmatter, { keepSourceTokens: false });
  if (doc.errors.length > 0) {
    return {
      rule: null,
      diagnostics: doc.errors.map((err) =>
        at(split.frontmatterStart + (err.pos[0] ?? 0), `invalid YAML: ${err.message}`),
      ),
    };
  }

  const place = (issue: Issue): Diagnostic =>
    issue.kind === "prose"
      ? at(issue.offset, issue.message)
      : at(split.frontmatterStart + offsetForPath(doc, issue.path), issue.message);

  const result = validateFrontmatter(doc.toJS());
  const diagnostics = (result.ok ? [] : result.issues).map(place);

  // Prose is checked even when the frontmatter failed: a contributor fixing one
  // typo should see every remaining problem in the same run, not one per run.
  const status = result.ok ? result.meta.status : null;
  diagnostics.push(...validateProse(split.body, split.bodyStart, status).map(place));

  if (!result.ok) return { rule: null, diagnostics };

  // `ruleId` is permanent and users write suppression comments against it, so
  // it has to be discoverable from the path and vice versa.
  const expected = `content/rules/${result.meta.ruleId}.md`;
  if (path !== expected) {
    diagnostics.push(
      at(
        split.frontmatterStart + offsetForPath(doc, ["ruleId"]),
        `ruleId \`${result.meta.ruleId}\` does not match its path (expected ${expected})`,
      ),
    );
  }

  if (diagnostics.length > 0) return { rule: null, diagnostics };
  return { rule: { file: path, meta: result.meta }, diagnostics: [] };
}

/** Load and validate every rule. Diagnostics are sorted by file, then position. */
export async function loadRules(): Promise<{ rules: LoadedRule[]; diagnostics: Diagnostic[] }> {
  const files = await findRuleFiles();
  const rules: LoadedRule[] = [];
  const diagnostics: Diagnostic[] = [];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const parsed = parseRuleFile(file, source);
    diagnostics.push(...parsed.diagnostics);
    if (parsed.rule) rules.push(parsed.rule);
  }

  const seen = new Map<string, string>();
  for (const rule of rules) {
    const first = seen.get(rule.meta.ruleId);
    if (first !== undefined) {
      diagnostics.push({
        file: rule.file,
        line: 1,
        col: 1,
        message: `duplicate ruleId \`${rule.meta.ruleId}\` (already defined in ${first})`,
      });
    } else {
      seen.set(rule.meta.ruleId, rule.file);
    }
  }

  rules.sort((a, b) => (a.meta.ruleId < b.meta.ruleId ? -1 : 1));
  diagnostics.sort(
    (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.col - b.col,
  );
  return { rules, diagnostics };
}

/**
 * A rule declaring `match: "logic"` must have a module, and a module must have
 * a rule. The orphan half matters most: a logic file with no markdown is a rule
 * with no documentation, which the project defines as not a rule.
 */
export async function checkLogicModules(
  rules: LoadedRule[],
  logicDir: string = LOGIC_DIR,
): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];

  let modules: string[];
  try {
    modules = (await readdir(logicDir, { recursive: true }))
      .filter((entry) => entry.endsWith(".ts"))
      .map((entry) => entry.split(sep).join("/"))
      .sort();
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    modules = [];
  }

  const present = new Set(modules);
  const declared = new Set<string>();

  for (const rule of rules) {
    if (rule.meta.match !== "logic") continue;
    const expected = `${rule.meta.ruleId}.ts`;
    declared.add(expected);
    if (!present.has(expected)) {
      diagnostics.push({
        file: rule.file,
        line: 1,
        col: 1,
        message: `declares \`match: "logic"\` but packages/rules/logic/${expected} does not exist`,
      });
    }
  }

  for (const module of modules) {
    if (declared.has(module)) continue;
    diagnostics.push({
      file: `packages/rules/logic/${module}`,
      line: 1,
      col: 1,
      message:
        `orphan logic module: no rule declares \`match: "logic"\` for ` +
        `\`${module.slice(0, -3)}\`. A rule with no documentation is not a rule.`,
    });
  }

  return diagnostics.sort((a, b) => a.file.localeCompare(b.file));
}

/** `path:line:col  message`, the shape every editor can jump to. */
export function printDiagnostics(diagnostics: Diagnostic[]): void {
  for (const d of diagnostics) {
    const where = styleText("cyan", `${d.file}:${d.line}:${d.col}`);
    process.stderr.write(`${styleText("red", "✗")} ${where}  ${d.message}\n`);
  }
}
