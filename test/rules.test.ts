import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import {
  type LoadedRule,
  ROOT,
  checkLogicModules,
  loadRules,
  parseRuleFile,
} from "../scripts/rules-source.ts";

const { rules, diagnostics } = await loadRules();

const format = (list: typeof diagnostics): string =>
  list.map((d) => `${d.file}:${d.line}:${d.col}  ${d.message}`).join("\n");

test("every rule in content/rules validates", () => {
  assert.equal(format(diagnostics), "");
  assert.ok(rules.length > 0, "expected at least one rule");
});

test("every declared logic module exists, and none is an orphan", async () => {
  assert.equal(format(await checkLogicModules(rules)), "");
});

test("the corpus covers all three rule shapes", () => {
  const shapes = {
    "selector only": rules.filter((r) => r.meta.selector !== null && r.meta.match === null),
    "selector + logic": rules.filter(
      (r) => r.meta.kind === "element" && r.meta.selector !== null && r.meta.match === "logic",
    ),
    document: rules.filter((r) => r.meta.kind === "document"),
  };
  for (const [shape, matching] of Object.entries(shapes)) {
    assert.ok(matching.length > 0, `no rule exercises the "${shape}" shape`);
  }
});

test("logic modules export the entry point their kind requires", async () => {
  for (const rule of rules) {
    if (rule.meta.match !== "logic") continue;
    const module: Record<string, unknown> = await import(
      resolve(ROOT, "packages/rules/logic", `${rule.meta.ruleId}.ts`)
    );
    const entry = rule.meta.kind === "document" ? "check" : "match";
    assert.equal(
      typeof module[entry],
      "function",
      `${rule.meta.ruleId} must export ${entry}()`,
    );
  }
});

test("every rule has a valid.html and an invalid.html fixture", async () => {
  for (const rule of rules) {
    for (const name of ["valid.html", "invalid.html"]) {
      const path = resolve(ROOT, "test/fixtures", rule.meta.ruleId, name);
      const info = await stat(path).catch(() => null);
      assert.ok(info?.isFile(), `missing fixture test/fixtures/${rule.meta.ruleId}/${name}`);
      assert.ok((info?.size ?? 0) > 0, `empty fixture test/fixtures/${rule.meta.ruleId}/${name}`);
    }
  }
});

test("fixtures are LF and UTF-8, because fixes are byte offsets into them", async () => {
  for (const rule of rules) {
    for (const name of ["valid.html", "invalid.html"]) {
      const path = resolve(ROOT, "test/fixtures", rule.meta.ruleId, name);
      const bytes = await readFile(path);
      assert.ok(!bytes.includes(0x0d), `CRLF in test/fixtures/${rule.meta.ruleId}/${name}`);
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      assert.equal(Buffer.byteLength(text, "utf8"), bytes.length);
    }
  }
});

// --- diagnostics point at the offending line --------------------------------
// The whole reason `yaml` is a dependency: its document AST carries source
// ranges, so a contributor gets a line number instead of "somewhere above".

const FILE = resolve(ROOT, "content/rules/meta/example.md");

const doc = (frontmatter: string): string =>
  `---\n${frontmatter}---\n\nWhat it is.\n\n## Why avoid\n\nBecause.\n\n## Use instead\n\nDelete it.\n\n## Detectability\n\nFully.\n\n## Resources\n\n- https://example.com/one\n- https://example.com/two\n`;

const VALID_FRONTMATTER = [
  'ruleId: "meta/example"\n',
  'title: "Example"\n',
  'description: "One-line summary."\n',
  'pubDate: "2026-01-02"\n',
  'status: "avoid"\n',
  'severity: "unnecessary"\n',
  'standardsBasis: "spec"\n',
  'detectability: "yes"\n',
  'kind: "element"\n',
  'scope: "head"\n',
  "selector: 'meta[name=example]'\n",
  'fix: { op: "remove-element" }\n',
  'replacement: "Delete it."\n',
].join("");

test("a synthetic well-formed rule parses cleanly", () => {
  const { rule, diagnostics: found } = parseRuleFile(FILE, doc(VALID_FRONTMATTER));
  assert.equal(format(found), "");
  assert.equal(rule?.meta.ruleId, "meta/example");
  assert.equal(rule?.file, "content/rules/meta/example.md");
});

test("a bad enum value is reported at its own line", () => {
  const source = doc(VALID_FRONTMATTER.replace('severity: "unnecessary"', 'severity: "warning"'));
  const { diagnostics: found } = parseRuleFile(FILE, source);
  assert.equal(found.length, 1);
  assert.equal(found[0]?.file, "content/rules/meta/example.md");
  assert.equal(found[0]?.line, 7); // line 1 is the opening `---`
  assert.equal(found[0]?.col, 1);
  assert.match(found[0]?.message ?? "", /unknown value `warning`/);
});

test("a nested fix.op is reported at the `op` key, not at `fix`", () => {
  const source = doc(VALID_FRONTMATTER.replace('op: "remove-element"', 'op: "rewrite"'));
  const { diagnostics: found } = parseRuleFile(FILE, source);
  assert.equal(found.length, 1);
  assert.equal(found[0]?.line, 13);
  assert.equal(found[0]?.col, 8); // the `op` key inside the flow mapping
});

test("an unknown field is reported at the key that is not recognised", () => {
  const source = doc(`${VALID_FRONTMATTER}sevrity: "harmful"\n`);
  const { diagnostics: found } = parseRuleFile(FILE, source);
  assert.equal(found.length, 1);
  assert.equal(found[0]?.line, 15);
  assert.match(found[0]?.message ?? "", /unknown frontmatter field `sevrity`/);
});

test("ruleId must match the file path", () => {
  const source = doc(VALID_FRONTMATTER.replace("meta/example", "meta/renamed"));
  const { rule, diagnostics: found } = parseRuleFile(FILE, source);
  assert.equal(rule, null);
  assert.equal(found.length, 1);
  assert.equal(found[0]?.line, 2);
  assert.match(found[0]?.message ?? "", /expected content\/rules\/meta\/renamed\.md/);
});

test("broken YAML is reported as YAML, not as a schema failure", () => {
  const { diagnostics: found } = parseRuleFile(FILE, doc('ruleId: "meta/example\n'));
  assert.ok(found.length > 0);
  assert.match(found[0]?.message ?? "", /^invalid YAML:/);
});

test("prose problems are reported even when the frontmatter is also wrong", () => {
  const source = doc(VALID_FRONTMATTER.replace('status: "avoid"', 'status: "nonsense"')).replace(
    "- https://example.com/two\n",
    "",
  );
  const { diagnostics: found } = parseRuleFile(FILE, source);
  const joined = format(found);
  assert.match(joined, /unknown value `nonsense`/);
  assert.match(joined, /at least two independent sources/);
});

// --- logic modules and markdown must account for each other -----------------

const withLogicDir = async (
  files: string[],
  run: (dir: string) => Promise<void>,
): Promise<void> => {
  const dir = await mkdtemp(join(tmpdir(), "deadhead-logic-"));
  try {
    for (const file of files) {
      await mkdir(dirname(join(dir, file)), { recursive: true });
      await writeFile(join(dir, file), "export const match = () => false;\n");
    }
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const ruleDeclaringLogic: LoadedRule = (() => {
  const source = doc(VALID_FRONTMATTER.replace("selector:", 'match: "logic"\nselector:'));
  const { rule, diagnostics: found } = parseRuleFile(FILE, source);
  if (!rule) throw new Error(`test fixture should parse:\n${format(found)}`);
  return rule;
})();

test("a rule declaring match: logic without a module is reported", async () => {
  await withLogicDir([], async (dir) => {
    const found = await checkLogicModules([ruleDeclaringLogic], dir);
    assert.equal(found.length, 1);
    assert.equal(found[0]?.file, "content/rules/meta/example.md");
    assert.match(found[0]?.message ?? "", /meta\/example\.ts does not exist/);
  });
});

test("a logic module with no markdown behind it is reported as an orphan", async () => {
  await withLogicDir(["meta/example.ts", "link/ghost.ts"], async (dir) => {
    const found = await checkLogicModules([ruleDeclaringLogic], dir);
    assert.equal(found.length, 1);
    assert.equal(found[0]?.file, "packages/rules/logic/link/ghost.ts");
    assert.match(found[0]?.message ?? "", /orphan logic module/);
  });
});

test("a matched pair is silent", async () => {
  await withLogicDir(["meta/example.ts"], async (dir) => {
    assert.equal(format(await checkLogicModules([ruleDeclaringLogic], dir)), "");
  });
});
