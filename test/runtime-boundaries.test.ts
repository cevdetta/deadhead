import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { BaselineError, readBaseline } from "../packages/cli/baseline.ts";
import { fromProgram } from "../packages/eslint-plugin/adapter.ts";

const inTempDir = async (run: (dir: string) => Promise<void>): Promise<void> => {
  const dir = await mkdtemp(join(tmpdir(), "deadhead-boundaries-"));
  try {
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

test("a baseline with non-object entries reports a clear error, not a TypeError", async () => {
  await inTempDir(async (dir) => {
    const path = join(dir, "base.json");
    await writeFile(path, JSON.stringify({ version: 1, entries: { "a.html": 3 } }));
    await assert.rejects(() => readBaseline(path), (err: unknown) => {
      assert.ok(err instanceof BaselineError);
      assert.match((err as Error).message, /must map ruleIds to counts/);
      return true;
    });
  });
});

test("a baseline with non-integer counts reports a clear error", async () => {
  await inTempDir(async (dir) => {
    const path = join(dir, "base.json");
    await writeFile(path, JSON.stringify({ version: 1, entries: { "a.html": { "r/one": "two" } } }));
    await assert.rejects(() => readBaseline(path), BaselineError);
  });
});

test("a parser AST change reports a clear error, not a TypeError", () => {
  for (const bad of [null, 42, "Program", {}, { nope: true }]) {
    if (bad !== null && typeof bad === "object" && ("type" in bad || "children" in bad || "body" in bad)) {
      continue;
    }
    assert.throws(
      () => fromProgram(bad, "<html></html>"),
      /unexpected @html-eslint\/parser AST/,
      `expected a clear parser-shape error for ${JSON.stringify(bad)}`,
    );
  }
});
