/**
 * The manual bookmarklet gate needs a server whose only console noise is the
 * page's own favicon refusal: the pass criterion is "no CSP or Trusted Types
 * errors", and the tester must be told which single error to ignore.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";

const boot = (): Promise<{ port: number; output: string; stop: () => void }> =>
  new Promise((resolve, reject) => {
    const child = spawn("node", ["scripts/check-bookmarklet-csp.ts"], { stdio: ["ignore", "pipe", "pipe"] });
    let text = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("check-bookmarklet-csp printed nothing in 10s"));
    }, 10_000);
    child.stdout.on("data", (chunk: Buffer) => {
      text += chunk.toString("utf8");
      const port = /127\.0\.0\.1:(\d+)/.exec(text)?.[1];
      if (port !== undefined) {
        clearTimeout(timer);
        resolve({ port: Number(port), output: text, stop: () => child.kill() });
      }
    });
    child.on("error", reject);
  });

test("the gate server answers the favicon with empty and names it in the steps", async () => {
  const { port, output, stop } = await boot();
  try {
    const page = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(page.status, 200);
    assert.ok((page.headers.get("content-security-policy") ?? "").includes("require-trusted-types-for"));
    const icon = await fetch(`http://127.0.0.1:${port}/f.ico`);
    assert.equal(icon.status, 204);
    assert.match(output, /f\.ico/);
  } finally {
    stop();
  }
});
