#!/usr/bin/env node
/**
 * Bundle the browser build into one self-contained IIFE.
 *
 * No bundler. Not out of purity: a `javascript:` URL has to be a single
 * expression with everything inlined, and the module graph here is nine files
 * of our own code in a uniform style. `stripTypeScriptTypes` (the same library
 * Node uses internally) removes the types; the rest is resolving imports in
 * dependency order and giving each module its own scope.
 *
 * Two properties the output must keep:
 *
 * - **No `fetch`, no `import()`.** Everything, including `rules.json` and the
 *   logic modules, is inlined. A page with a strict Content-Security-Policy is
 *   exactly the kind worth inspecting, and it must not be able to block this.
 * - **Own scope per module.** Two logic modules both exporting `match` is the
 *   normal case, so flat concatenation would break the moment a second rule
 *   needs code.
 *
 * Emits `packages/browser/bookmarklet.js`, which doubles as the devtools
 * snippet — paste it into Sources → Snippets and run. The `javascript:` URL is
 * printed for the bookmark itself.
 */

import { readFile, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { styleText } from "node:util";

import type { RuleMeta } from "../packages/core/vocabulary.ts";
import { ROOT, rel } from "./rules-source.ts";

const ENTRY = resolve(ROOT, "packages/browser/bookmarklet.ts");
const RULES_JSON = resolve(ROOT, "packages/rules/rules.json");
const OUT = resolve(ROOT, "packages/browser/bookmarklet.js");

/** `import ... from "./relative.ts"` — the only import form this codebase uses. */
const IMPORT = /^\s*import\s+(?:([\w$]+)\s*,\s*)?(?:\{([^}]*)\}|([\w$]+))\s+from\s+["']([^"']+)["'];?\s*$/gm;
/** Re-exports, which `packages/core/index.ts` is made of. */
const REEXPORT = /^\s*export\s*\{([^}]*)\}\s*from\s+["']([^"']+)["'];?\s*$/gm;

const moduleName = (file: string): string =>
  `__m_${relative(ROOT, file).replace(/[^a-zA-Z0-9]/g, "_")}`;

type Module = { file: string; body: string; deps: string[]; exports: string[] };

/**
 * Named exports of a stripped module.
 *
 * The re-export form matters as much as the declaration form:
 * `packages/core/index.ts` is nothing but `export { ... } from "./x.ts"`, so a
 * scanner that only understood declarations would give the package's public
 * entry point an empty export list and every consumer would see `undefined`.
 */
function exportsOf(source: string): string[] {
  const names = new Set<string>();

  for (const m of source.matchAll(/^\s*export\s+(?:const|let|var|function|class)\s+([\w$]+)/gm)) {
    names.add(m[1] as string);
  }
  // `export { a, b as c };` and `export { a, b as c } from "./x.ts";` alike.
  for (const m of source.matchAll(/^\s*export\s*\{([^}]*)\}\s*(?:from\s+["'][^"']+["'])?\s*;?\s*$/gm)) {
    for (const part of (m[1] as string).split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop()?.trim();
      // `type` specifiers are gone after stripping, but guard anyway.
      if (name && name !== "type") names.add(name);
    }
  }
  return [...names];
}

/** Rewrite ESM syntax into plain statements inside the module's own scope. */
function rewrite(source: string, file: string): { body: string; deps: string[] } {
  const deps: string[] = [];

  const resolveDep = (specifier: string): string => {
    const target = resolve(dirname(file), specifier);
    deps.push(target);
    return moduleName(target);
  };

  let body = source.replace(REEXPORT, (_all, names: string, specifier: string) => {
    const from = resolveDep(specifier);
    // `a as b` becomes `a: b` so the local binding carries the exported name.
    const bindings = names
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part !== "")
      .map((part) => part.replace(/\s+as\s+/, ": "))
      .join(", ");
    return `const {${bindings}} = ${from};`;
  });

  body = body.replace(IMPORT, (all, def: string | undefined, named: string | undefined, star: string | undefined, specifier: string) => {
    if (!specifier.startsWith(".")) {
      throw new Error(`${rel(file)}: bare import ${JSON.stringify(specifier)} cannot be inlined`);
    }
    const from = resolveDep(specifier);
    if (star !== undefined) return `const ${star} = ${from};`;
    const parts: string[] = [];
    if (def !== undefined) parts.push(`const ${def} = ${from}.default;`);
    if (named !== undefined) parts.push(`const {${named}} = ${from};`);
    return parts.join(" ") || `/* ${all.trim()} */`;
  });

  // `export` is only a marker once each module has its own scope; the export
  // object is built explicitly at the end of the wrapper.
  body = body.replace(/^\s*export\s+(?=const|let|var|function|class|async)/gm, "");
  body = body.replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, "");

  return { body, deps };
}

/** Depth-first walk of the import graph, emitting dependencies before dependents. */
async function collect(entry: string): Promise<Module[]> {
  const ordered: Module[] = [];
  const state = new Map<string, "visiting" | "done">();

  const visit = async (file: string): Promise<void> => {
    const seen = state.get(file);
    if (seen === "done") return;
    if (seen === "visiting") throw new Error(`import cycle at ${rel(file)}`);
    state.set(file, "visiting");

    const source = stripTypeScriptTypes(await readFile(file, "utf8"), { mode: "strip" });
    const { body, deps } = rewrite(source, file);
    for (const dep of deps) await visit(dep);

    ordered.push({ file, body, deps, exports: exportsOf(source) });
    state.set(file, "done");
  };

  await visit(entry);
  return ordered;
}

const wrap = (module: Module): string =>
  `const ${moduleName(module.file)} = (() => {\n${module.body}\nreturn {${module.exports.join(", ")}};\n})();`;

// --- build ------------------------------------------------------------------

const { rules } = JSON.parse(await readFile(RULES_JSON, "utf8")) as { rules: RuleMeta[] };

const logicFiles = new Map<string, string>();
for (const meta of rules) {
  if (meta.match !== "logic" && meta.kind !== "document") continue;
  logicFiles.set(meta.ruleId, resolve(ROOT, "packages/rules/logic", `${meta.ruleId}.ts`));
}

const modules = await collect(ENTRY);
// Logic modules are reached through rules.json, not through an import, so they
// have to be pulled into the graph explicitly.
for (const file of logicFiles.values()) {
  if (!modules.some((m) => m.file === file)) modules.unshift(...(await collect(file)));
}

const seen = new Set<string>();
const unique = modules.filter((m) => (seen.has(m.file) ? false : (seen.add(m.file), true)));

const ruleLiterals = rules.map((meta) => {
  const file = logicFiles.get(meta.ruleId);
  const entry = meta.kind === "document" ? "check" : "match";
  const logic = file === undefined ? "" : `, ${entry}: ${moduleName(file)}.${entry}`;
  return `{ meta: ${JSON.stringify(meta)}${logic} }`;
});

const bundle = `/* deadhead bookmarklet — generated by scripts/build-bookmarklet.ts. Do not edit.
 * ${rules.length} rule(s) inlined. No network access: nothing here can be blocked by CSP.
 * Paste into devtools → Sources → Snippets, or use the javascript: URL. */
(() => {
${unique.map(wrap).join("\n\n")}

return ${moduleName(ENTRY)}.boot([\n${ruleLiterals.join(",\n")}\n]);
})();
`;

await writeFile(OUT, bundle, "utf8");

const url = `javascript:${encodeURIComponent(bundle)}`;
process.stdout.write(
  `${styleText("green", "✓")} ${unique.length} module(s), ${rules.length} rule(s) → ${rel(OUT)}\n` +
    `  snippet: paste the file into devtools → Sources → Snippets\n` +
    `  bookmarklet URL: ${(url.length / 1024).toFixed(1)} kB\n`,
);
