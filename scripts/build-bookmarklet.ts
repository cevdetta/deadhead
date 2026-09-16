#!/usr/bin/env node
/**
 * Bundle the browser build into one self-contained IIFE.
 *
 * Rolldown does the bundling and minifying: the module graph here is our own
 * uniform ESM+TS, which is exactly what it eats natively, and it belongs to
 * the same toolchain family as the site (Vite 8 runs on rolldown), so this
 * is one dependency pulling in one direction rather than two. The hand-rolled
 * bundler and minifier this replaces are gone; what remains is the part no
 * bundler can do, assembling the rule set.
 *
 * Two properties the output must keep:
 *
 * - **No `fetch`, no `import()`.** Everything, including the rule literals
 *   and the logic modules, is inlined. A page with a strict
 *   Content-Security-Policy is exactly the kind worth inspecting, and it must
 *   not be able to block this.
 * - **Findings come back out.** The entry re-exports `boot` and every logic
 *   entry point under a single `__deadhead` global, and the build appends one
 *   `__deadhead.boot([...])` call. The snippet's completion value is the
 *   findings array, which is what the conformance suite executes against.
 *   (An IIFE tail `return` would be the obvious shape, but oxc-family
 *   compress drops it as unused — the appended call survives every minifier.)
 *
 * Emits `packages/browser/bookmarklet.js`, which doubles as the devtools
 * snippet — paste it into Sources → Snippets and run. The `javascript:` URL is
 * printed for the bookmark itself.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { styleText } from "node:util";
import { rolldown } from "rolldown";

import type { RuleMeta } from "../packages/core/vocabulary.ts";
import { ROOT, rel } from "./rules-source.ts";

const ENTRY = resolve(ROOT, "packages/browser/bookmarklet.ts");
const RULES_JSON = resolve(ROOT, "packages/rules/rules.json");
const OUT = resolve(ROOT, "packages/browser/bookmarklet.js");
// Generated entry, not source: it exists so rolldown sees the logic modules,
// which rules.json reaches without an import. Under .git/ it never pollutes
// the tree and never ships.
const GEN_DIR = resolve(ROOT, ".git/deadhead/bundle-entry");
const GEN_ENTRY = resolve(GEN_DIR, "entry.ts");
/** The one page-global the snippet leaves behind. Double runs redeclare it. */
export const GLOBAL = "__deadhead";

/**
 * Exactly the keys the bookmarklet reads: the engine dispatches on selector,
 * kind, scope and match, and reports ruleId, severity, description,
 * replacement, detectability and fix. The rest (title, pubDate, status,
 * standardsBasis, tags, impacts, related) is prose and site data that would
 * ride the javascript: URL unread.
 */
export const SLIM_KEYS = [
  "ruleId",
  "description",
  "severity",
  "detectability",
  "kind",
  "scope",
  "selector",
  "match",
  "fix",
  "replacement",
] as const;

export type SlimMeta = Pick<RuleMeta, (typeof SLIM_KEYS)[number]>;

export function toSlimMeta(meta: RuleMeta): SlimMeta {
  return {
    ruleId: meta.ruleId,
    description: meta.description,
    severity: meta.severity,
    detectability: meta.detectability,
    kind: meta.kind,
    scope: meta.scope,
    selector: meta.selector,
    match: meta.match,
    fix: meta.fix,
    replacement: meta.replacement,
  };
}

/** Which logic entry a rule wires, following its kind. */
export function logicEntryFor(meta: RuleMeta): "check" | "match" {
  return meta.kind === "document" ? "check" : "match";
}

/** Whether a rule needs a logic module inlined. */
export function needsLogic(meta: RuleMeta): boolean {
  return meta.match === "logic" || meta.kind === "document";
}

export function logicVarName(meta: RuleMeta): string {
  return `${logicEntryFor(meta)}_${meta.ruleId.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

/** One `{ meta, [match|check] }` literal for the appended `boot()` call. */
export function buildRuleLiteral(meta: RuleMeta, hasLogic: boolean): string {
  let logic = "";
  if (hasLogic) {
    const entry = logicEntryFor(meta);
    logic = `, ${entry}: ${GLOBAL}.${logicVarName(meta)}`;
  }
  return `{ meta: ${JSON.stringify(toSlimMeta(meta))}${logic} }`;
}

/** The appended call that survives minification where a tail `return` would not. */
export function buildBootCall(literals: string[]): string {
  return `${GLOBAL}.boot([\n${literals.join(",\n")}\n]);`;
}

const { rules } = JSON.parse(await readFile(RULES_JSON, "utf8")) as { rules: RuleMeta[] };

const logicFiles = new Map<string, string>();
for (const meta of rules) {
  if (meta.match !== "logic" && meta.kind !== "document") continue;
  logicFiles.set(meta.ruleId, resolve(ROOT, "packages/rules/logic", `${meta.ruleId}.ts`));
}

/** Import specifier from the generated entry to a repo file. */
export const spec = (file: string): string => {
  const turned = relative(dirname(GEN_ENTRY), file).replace(/\\/g, "/");
  return turned.startsWith(".") ? turned : `./${turned}`;
};

const imports = [`import { boot } from "${spec(ENTRY)}";`];
const names = ["boot"];
const ruleLiterals = rules.map((meta) => {
  const file = logicFiles.get(meta.ruleId);
  if (file !== undefined) {
    const entry = logicEntryFor(meta);
    const name = logicVarName(meta);
    imports.push(`import { ${entry} as ${name} } from "${spec(file)}";`);
    names.push(name);
  }
  return buildRuleLiteral(meta, file !== undefined);
});

await mkdir(GEN_DIR, { recursive: true });
await writeFile(GEN_ENTRY, `${imports.join("\n")}\nexport { ${names.join(", ")} };\n`);

const built = await rolldown({ input: GEN_ENTRY });
const { output } = await built.generate({ format: "iife", name: GLOBAL, minify: true });
await built.close();
const chunk = output[0];
if (chunk === undefined || !("code" in chunk)) throw new Error("rolldown emitted no chunk");

const bundle = `/* deadhead bookmarklet — generated by scripts/build-bookmarklet.ts. Do not edit.
 * ${rules.length} rule(s) inlined. No network access: nothing here can be blocked by CSP.
 * Paste into devtools → Sources → Snippets, or use the javascript: URL. */
${chunk.code.trimEnd()}
${buildBootCall(ruleLiterals)}
`;

await writeFile(OUT, bundle, "utf8");

const url = `javascript:${encodeURIComponent(bundle)}`;
process.stdout.write(
  `${styleText("green", "✓")} ${rules.length} rule(s) → ${rel(OUT)}\n` +
    `  snippet: paste the file into devtools → Sources → Snippets\n` +
    `  bookmarklet URL: ${(url.length / 1024).toFixed(1)} kB\n`,
);
