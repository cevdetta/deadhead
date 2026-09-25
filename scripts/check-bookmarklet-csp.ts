#!/usr/bin/env node
/** Serve a page under the strictest CSP and Trusted Types, for a manual bookmarklet check in real browsers. */
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

const page = await readFile(new URL("../test/browser/hostile.html", import.meta.url));
const server = createServer((_req, res) => {
  res.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "content-security-policy": "default-src 'none'; style-src 'self'; require-trusted-types-for 'script'",
  });
  res.end(page);
});
server.listen(0, "127.0.0.1", () => {
  const { port } = server.address() as { port: number };
  process.stdout.write(
    `Serving http://127.0.0.1:${port}/ under a strict CSP.\n` +
      "1. pnpm build:bookmarklet, then copy the printed javascript: URL into a bookmark in Chrome, Firefox and Safari.\n" +
      "2. Open the page, click the bookmark. Pass: a styled panel listing 3 findings, and no CSP or Trusted Types errors in the console.\n" +
      "Ctrl-C to stop.\n",
  );
});
