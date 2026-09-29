/**
 * The SEO gate must work on a synthetic dist, never the real site/dist: this
 * suite runs in the root `pnpm test`, which does not build the site.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../scripts/site-seo.ts", import.meta.url));

export const HOME_DESCRIPTION =
  "A documentation-driven linter for the HTML head: it finds deprecated, unnecessary and harmful markup, and every finding links to a sourced explanation.";

type Parts = { title?: string; description?: string; head?: string; body?: string };

/** One page; by default valid for every check this suite knows. */
const page = ({ title = "A page", description = "A synthetic page, described at a length the checks accept.", head = "", body = "<h1>A page</h1>" }: Parts = {}) =>
  `<!doctype html><html lang="en"><head><title>${title}</title><meta name="description" content="${description}">${head}</head><body>${body}</body></html>`;

/** The smallest dist that passes: a home page and one rule page. */
const defaultPages = (): Record<string, string> => ({
  "index.html": page({ title: "deadhead: lint the HTML head for dead and harmful markup", description: HOME_DESCRIPTION }),
  "rules/meta/a.html": page({ title: "Rule meta/a" }),
});

async function runGate(pages: Record<string, string>): Promise<{ status: number | null; out: string }> {
  const dir = await mkdtemp(join(tmpdir(), "site-seo-"));
  try {
    for (const [rel, html] of Object.entries(pages)) {
      await mkdir(dirname(join(dir, rel)), { recursive: true });
      await writeFile(join(dir, rel), html);
    }
    const result = spawnSync(process.execPath, [SCRIPT, dir], { encoding: "utf8" });
    return { status: result.status, out: result.stdout + result.stderr };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("passes a dist whose pages each carry one h1", async () => {
  const { status, out } = await runGate(defaultPages());
  assert.equal(status, 0, out);
  assert.match(out, /SEO checks passed on 2 pages/);
});

test("fails a page with no h1 or with two", async () => {
  const pages = defaultPages();
  pages["rules/meta/a.html"] = page({ body: "<p>no heading</p>" });
  pages["rules/meta/b.html"] = page({ title: "Rule meta/b", body: "<h1>one</h1><h1>two</h1>" });
  const { status, out } = await runGate(pages);
  assert.equal(status, 1);
  assert.match(out, /rules\/meta\/a\.html: 0 <h1> elements/);
  assert.match(out, /rules\/meta\/b\.html: 2 <h1> elements/);
});

test("skips a file with no head, such as a verification page", async () => {
  const pages = defaultPages();
  pages["google0123.html"] = "google-site-verification: google0123.html";
  const { status, out } = await runGate(pages);
  assert.equal(status, 0, out);
});

test("fails a home title or description holding < or >", async () => {
  const pages = defaultPages();
  pages["index.html"] = page({ title: "deadhead: lint HTML &lt;head&gt;", description: HOME_DESCRIPTION.replace("the HTML head", "HTML &lt;head&gt;") });
  const { status, out } = await runGate(pages);
  assert.equal(status, 1);
  assert.match(out, /index\.html: title holds < or >/);
  assert.match(out, /index\.html: description holds < or >/);
});

test("fails a home description under 120 characters", async () => {
  const pages = defaultPages();
  pages["index.html"] = page({ title: "deadhead", description: "A linter for the HTML head, with sources for every finding." });
  const { status, out } = await runGate(pages);
  assert.equal(status, 1);
  assert.match(out, /index\.html: description is 59 characters, want 120-160/);
});
