// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://deadhead.cevdet.ch",

  // `ruleUrl()` in packages/core/vocabulary.ts prints
  // https://deadhead.cevdet.ch/rules/<ruleId> — no trailing slash — into every
  // finding, every SARIF upload and every ESLint rule's metadata, all of which
  // outlive the run that emitted them. So "never" is a contract, not taste.
  //
  // `format: "file"` is what makes it true on the host. Cloudflare Pages
  // canonicalises a directory index the other way: given /foo/index.html it
  // serves /foo/ and 308s /foo to it. Emitting /foo.html instead gets the
  // extensionless, slash-free URL with no redirect, which is Cloudflare's own
  // documented advice for this case.
  trailingSlash: "never",
  build: { format: "file" },

  integrations: [sitemap()],
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" } },
  },
});
