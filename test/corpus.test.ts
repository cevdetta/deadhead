import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { classifyRaw, duplicateRanks, isBlocked, type RawFacts } from "../corpus/classify.ts";
import { errorKind, fetchSite, USER_AGENT } from "../corpus/fetch.ts";
import { parseList } from "../corpus/list.ts";
import { disallowsRoot, TOKEN } from "../corpus/robots.ts";
import { wilson } from "../corpus/stats.ts";

const round4 = ([lo, hi]: [number, number]): [number, number] => [Math.round(lo * 1e4) / 1e4, Math.round(hi * 1e4) / 1e4];

test("wilson: 95% intervals at the edges and for rare rates", () => {
  assert.deepEqual(round4(wilson(0, 100)), [0, 0.037]);
  assert.deepEqual(round4(wilson(100, 100)), [0.963, 1]);
  assert.deepEqual(round4(wilson(1, 1000)), [0.0002, 0.0056]);
  assert.deepEqual(round4(wilson(70, 7000)), [0.0079, 0.0126]);
  assert.deepEqual(wilson(0, 0), [0, 0]);
});

test("robots: the * group decides when no group names the token", () => {
  assert.equal(disallowsRoot("User-agent: *\nDisallow: /"), true);
  assert.equal(disallowsRoot("User-agent: *\nDisallow: /private"), false);
  assert.equal(disallowsRoot("User-agent: *\nDisallow:"), false);
  assert.equal(disallowsRoot("User-agent: *\r\nDisallow: /*\r\n"), true);
  assert.equal(disallowsRoot("# none\nUser-agent: *  # all\nDisallow: /  # everything"), true);
  assert.equal(disallowsRoot(""), false);
});

test("robots: a group naming the token wins over *", () => {
  assert.equal(disallowsRoot(`User-agent: *\nDisallow: /\n\nUser-agent: ${TOKEN}\nAllow: /`), false);
  assert.equal(disallowsRoot(`User-agent: *\nAllow: /\n\nUser-agent: DeadHead-Research\nDisallow: /`), true);
  assert.equal(disallowsRoot("User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nAllow: /"), false);
});

test("robots: an equal Allow beats Disallow, and agents in one group share its rules", () => {
  assert.equal(disallowsRoot("User-agent: *\nDisallow: /\nAllow: /"), false);
  assert.equal(disallowsRoot("User-agent: Googlebot\nUser-agent: *\nDisallow: /"), true);
});

const facts = (overrides: Partial<RawFacts>): RawFacts => ({
  robots: "allowed",
  error: null,
  status: 200,
  contentType: "text/html; charset=utf-8",
  bytes: 200_000,
  head: "<!doctype html><title>Home</title>",
  ...overrides,
});

test("classify: each outcome from its facts", () => {
  assert.equal(classifyRaw(facts({})), "linted");
  assert.equal(classifyRaw(facts({ robots: "disallowed" })), "skipped");
  assert.equal(classifyRaw(facts({ error: "dns", status: null })), "no-site");
  assert.equal(classifyRaw(facts({ error: "connect", status: null })), "no-site");
  assert.equal(classifyRaw(facts({ error: "tls", status: null })), "no-site");
  assert.equal(classifyRaw(facts({ error: "timeout", status: null })), "failed");
  assert.equal(classifyRaw(facts({ status: 503 })), "failed");
  assert.equal(classifyRaw(facts({ contentType: "application/json" })), "failed");
  assert.equal(classifyRaw(facts({ contentType: null })), "failed");
});

test("classify: both blocked thresholds", () => {
  assert.equal(isBlocked(9_999, "<html>"), true, "under 10 kB");
  assert.equal(isBlocked(50_000, "<title>Just a moment...</title>"), true, "challenge marker under 60 kB");
  assert.equal(isBlocked(50_000, "<title>Home</title>"), false);
  assert.equal(isBlocked(80_000, "<title>Just a moment...</title>"), false, "60 kB and up is a page that mentions it");
  assert.equal(classifyRaw(facts({ bytes: 4_000 })), "blocked");
});

test("classify: a final origin counts once, at the best rank", () => {
  const dup = duplicateRanks([
    { rank: 5, finalOrigin: "https://aws.amazon.com" },
    { rank: 2, finalOrigin: "https://aws.amazon.com" },
    { rank: 3, finalOrigin: null },
    { rank: 4, finalOrigin: null },
    { rank: 1, finalOrigin: "https://www.google.com" },
  ]);
  assert.deepEqual([...dup], [5]);
});

test("list: Tranco CSV rows, CRLF and blank lines tolerated", () => {
  assert.deepEqual(parseList("1,google.com\r\n2,cloudflare.com\r\n\r\n"), [
    { rank: 1, domain: "google.com" },
    { rank: 2, domain: "cloudflare.com" },
  ]);
  assert.deepEqual(parseList("rank,domain\nx,broken\n3,example.org"), [{ rank: 3, domain: "example.org" }]);
});

test("fetch: errors sort into the classes classify needs", () => {
  const withCode = (code: string) => Object.assign(new TypeError("fetch failed"), { cause: Object.assign(new Error(code), { code }) });
  assert.equal(errorKind(withCode("ENOTFOUND")), "dns");
  assert.equal(errorKind(withCode("ECONNREFUSED")), "connect");
  assert.equal(errorKind(withCode("ERR_TLS_CERT_ALTNAME_INVALID")), "tls");
  assert.equal(errorKind(withCode("UND_ERR_CONNECT_TIMEOUT")), "timeout");
  assert.equal(errorKind(Object.assign(new Error("t"), { name: "TimeoutError" })), "timeout");
  assert.equal(errorKind(new Error("other")), "other");
});

test("fetch: robots.txt, the www retry, redirects and the user agent", async (t) => {
  const seen: string[] = [];
  const server = createServer((req, res) => {
    seen.push(`${req.headers["user-agent"] ?? ""} ${req.url ?? ""}`);
    const host = new URL(req.url ?? "/", "http://x").searchParams.get("host");
    if (req.url?.startsWith("/robots.txt")) {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end(host === "blocked.test" ? "User-agent: *\nDisallow: /" : "User-agent: *\nDisallow: /admin");
      return;
    }
    if (req.url?.startsWith("/?")) {
      res.writeHead(302, { location: `/home?host=${host}` });
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<!doctype html><title>Home</title>");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const { port } = server.address() as AddressInfo;
  // A port that was free a moment ago; fetch refuses port 1 as a bad port before connecting.
  const closed = createServer();
  await new Promise<void>((resolve) => closed.listen(0, "127.0.0.1", resolve));
  const closedPort = (closed.address() as AddressInfo).port;
  await new Promise<void>((resolve) => closed.close(() => resolve()));
  // The apex points at a closed port, so it fails to connect and the www host is tried.
  const url = (host: string, path: string) =>
    host.startsWith("www.") || path === "/robots.txt"
      ? `http://127.0.0.1:${port}${path}${path.includes("?") ? "&" : "?"}host=${host}`
      : `http://127.0.0.1:${closedPort}${path}`;

  const ok = await fetchSite("example.test", { url });
  assert.equal(ok.robots, "allowed");
  assert.equal(ok.tried.length, 2);
  assert.equal(ok.status, 200);
  assert.match(ok.finalUrl ?? "", /\/home\?host=www\.example\.test$/);
  assert.equal(ok.body?.toString("utf8"), "<!doctype html><title>Home</title>");
  assert.equal(ok.error, null);
  assert.ok(seen.every((line) => line.startsWith(USER_AGENT)));

  const blocked = await fetchSite("blocked.test", { url });
  assert.equal(blocked.robots, "disallowed");
  assert.deepEqual(blocked.tried, []);
  assert.equal(blocked.body, null);
});
