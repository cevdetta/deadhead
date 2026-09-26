/**
 * The byte budget gate must work on a synthetic dist, never the real
 * site/dist: this suite runs in the root `pnpm test`, which does not build
 * the site.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

const SCRIPT = new URL("../scripts/site-budget.ts", import.meta.url).pathname;

const gz = (text: string) => gzipSync(Buffer.from(text), { level: 9 }).length;

async function withDist(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "site-budget-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const home = "<html><body>home page " + "x".repeat(2000) + "</body></html>";
const rulesIndex = "<html><body>rules index " + "y".repeat(3000) + "</body></html>";
const rulePages = {
  "meta/a.html": "<html><body>rule meta/a " + "a".repeat(1000) + "</body></html>",
  "meta/b.html": "<html><body>rule meta/b " + "b".repeat(2000) + "</body></html>",
  "link/c.html": "<html><body>rule link/c " + "c".repeat(3000) + "</body></html>",
};
const astroCss = "." + "a".repeat(4000) + "{color:red}";
const astroJs = "console.log(" + "z".repeat(500) + ");";
const deadheadCss = "." + "d".repeat(99_000) + "{color:blue}"; // engine stylesheet at dist root, never counted
const bookmarkletJs = "javascript:" + "b".repeat(53_000); // bookmarklet at dist root, never counted

// A valid `_headers`: only `/_astro/*` (Astro's hashed build assets) is immutable.
const validHeaders = "/_astro/*\n  Cache-Control: public, max-age=31536000, immutable\n";

// A valid 404: noindex, and so no canonical or og:url (both would assert a
// canonical identity for a page that should not be indexed at all).
const notFoundNoindex =
  '<html><head><meta name="robots" content="noindex"></head><body>not found</body></html>';

type DistOverrides = {
  /** `null` omits the file entirely, to test the missing-file case. */
  headers?: string | null;
  notFound?: string;
};

async function writeSyntheticDist(dir: string, overrides: DistOverrides = {}): Promise<void> {
  await mkdir(join(dir, "dist", "_astro"), { recursive: true });
  await mkdir(join(dir, "dist", "rules", "meta"), { recursive: true });
  await mkdir(join(dir, "dist", "rules", "link"), { recursive: true });
  await writeFile(join(dir, "dist", "index.html"), home);
  await writeFile(join(dir, "dist", "rules.html"), rulesIndex);
  for (const [rel, content] of Object.entries(rulePages)) {
    await writeFile(join(dir, "dist", "rules", rel), content);
  }
  await writeFile(join(dir, "dist", "_astro", "global.abc123.css"), astroCss);
  await writeFile(join(dir, "dist", "_astro", "chunk.def456.js"), astroJs);
  await writeFile(join(dir, "dist", "deadhead.css"), deadheadCss);
  await writeFile(join(dir, "dist", "bookmarklet.js"), bookmarkletJs);

  const headers = overrides.headers === undefined ? validHeaders : overrides.headers;
  if (headers !== null) {
    await writeFile(join(dir, "dist", "_headers"), headers);
  }
  await writeFile(join(dir, "dist", "404.html"), overrides.notFound ?? notFoundNoindex);
}

const expected = {
  homeGzip: gz(home),
  rulesIndexGzip: gz(rulesIndex),
  rulePageAvgGzip: Math.round(
    Object.values(rulePages).reduce((sum, content) => sum + gz(content), 0) / Object.values(rulePages).length,
  ),
  cssRaw: Buffer.byteLength(astroCss),
};

/** Writes `site/budget.json` with every key padded above `expected`, unless overridden. */
async function writeBudget(dir: string, overrides: Partial<typeof expected> = {}): Promise<void> {
  await mkdir(join(dir, "site"), { recursive: true });
  const budget = {
    homeGzip: expected.homeGzip + 100,
    rulesIndexGzip: expected.rulesIndexGzip + 100,
    rulePageAvgGzip: expected.rulePageAvgGzip + 100,
    cssRaw: expected.cssRaw + 100,
    ...overrides,
  };
  await writeFile(join(dir, "site", "budget.json"), JSON.stringify(budget));
}

function run(dir: string): { status: number | null; stdout: string; stderr: string } {
  return spawnSync(process.execPath, [SCRIPT, "dist"], { cwd: dir, encoding: "utf8" });
}

test("prints the four measured values and passes when inside budget", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir);
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    for (const [key, value] of Object.entries(expected)) {
      const line = result.stdout.split("\n").find((l) => l.startsWith(key));
      assert.ok(line, `missing line for ${key} in:\n${result.stdout}`);
      assert.match(line, new RegExp(`^${key}\\s+${value}\\s+/`), `${key} line: ${line}`);
      assert.match(line, /\bok\b/, `${key} line should be ok: ${line}`);
    }
  });
});

test("cssRaw counts only dist/_astro/*.css: not deadhead.css, not bookmarklet.js, not non-css _astro files", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir);
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    const line = result.stdout.split("\n").find((l) => l.startsWith("cssRaw"));
    assert.ok(line);
    // deadhead.css (99,000+ bytes) and bookmarklet.js (53,000+ bytes) must not
    // be folded into cssRaw, which should equal only the _astro CSS bytes.
    assert.match(line, new RegExp(`^cssRaw\\s+${expected.cssRaw}\\s+/`), line);
    assert.ok(expected.cssRaw < deadheadCss.length, "sanity: astro css smaller than deadhead.css fixture");
  });
});

test("exits 1 and flags OVER on the homeGzip line when its budget is below the measured value", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir);
    await writeBudget(dir, { homeGzip: expected.homeGzip - 1 });

    const result = run(dir);

    assert.equal(result.status, 1, result.stdout + result.stderr);
    const homeLine = result.stdout.split("\n").find((l) => l.startsWith("homeGzip"));
    assert.ok(homeLine);
    assert.match(homeLine, /OVER/, homeLine);
    for (const key of ["rulesIndexGzip", "rulePageAvgGzip", "cssRaw"]) {
      const line = result.stdout.split("\n").find((l) => l.startsWith(key));
      assert.ok(line);
      assert.match(line, /\bok\b/, `${key} should stay ok: ${line}`);
    }
  });
});

test("passes with no problem lines when _headers and 404.html are both valid", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir);
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.doesNotMatch(result.stdout, /✗/, result.stdout);
  });
});

test("fails when dist/_headers is missing", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir, { headers: null });
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /_headers is missing/);
  });
});

test("fails when _headers also marks another path immutable", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir, {
      headers:
        validHeaders +
        "\n/bookmarklet.js\n  Cache-Control: public, max-age=31536000, immutable\n",
    });
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /\/bookmarklet\.js[^\n]*immutable/);
  });
});

test("fails when the 404 page carries a canonical link", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir, {
      notFound:
        '<html><head><meta name="robots" content="noindex">' +
        '<link rel="canonical" href="https://deadhead.cevdet.ch/404">' +
        "</head><body>not found</body></html>",
    });
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /404\.html[^\n]*canonical/);
  });
});

test("fails when the 404 page carries an og:url meta", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir, {
      notFound:
        '<html><head><meta name="robots" content="noindex">' +
        '<meta property="og:url" content="https://deadhead.cevdet.ch/404">' +
        "</head><body>not found</body></html>",
    });
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /404\.html[^\n]*og:url/);
  });
});

test("fails when the 404 page has no robots noindex", async () => {
  await withDist(async (dir) => {
    await writeSyntheticDist(dir, {
      notFound: "<html><head></head><body>not found</body></html>",
    });
    await writeBudget(dir);

    const result = run(dir);

    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stdout, /404\.html[^\n]*noindex/);
  });
});
