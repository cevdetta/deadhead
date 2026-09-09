/**
 * The bookmarklet's entry point: run the rules against the live document and
 * draw the results over the page.
 *
 * Exported as `boot(rules)` rather than running on import, so the build can
 * append one call with the rule set inlined. That is what keeps the artifact a
 * single IIFE with no `fetch` — nothing to load means there is no request for
 * a Content-Security-Policy to block, which is exactly the kind of page most
 * worth pointing this at.
 */

import { type Rule, run } from "../core/index.ts";
import type { Finding, Severity } from "../core/index.ts";
import { fromDocument } from "./adapter.ts";

const PANEL_ID = "deadhead-panel";

const COLOUR: Record<Severity, string> = {
  harmful: "#d7263d",
  deprecated: "#e08700",
  unnecessary: "#2d7dd2",
};

const escape = (value: string): string =>
  value.replace(/[&<>"]/g, (c) => `&${{ "&": "amp", "<": "lt", ">": "gt", '"': "quot" }[c]};`);

/**
 * `all: initial` on the shell, so a page's own stylesheet cannot restyle the
 * report. A linter whose output is unreadable on the site it is linting is
 * not much of a linter.
 */
const CSS = `
#${PANEL_ID}{all:initial;position:fixed;top:12px;right:12px;z-index:2147483647;
 max-height:calc(100vh - 24px);width:min(30rem,calc(100vw - 24px));overflow:auto;
 background:#fff;color:#111;border:1px solid #d0d0d0;border-radius:8px;
 box-shadow:0 8px 32px rgba(0,0,0,.24);font:13px/1.5 ui-sans-serif,system-ui,sans-serif}
#${PANEL_ID} *{all:unset;display:revert;box-sizing:border-box;font:inherit;color:inherit}
#${PANEL_ID} header{display:flex;align-items:center;justify-content:space-between;
 gap:.5rem;padding:.6rem .8rem;border-bottom:1px solid #e6e6e6;position:sticky;top:0;background:#fff}
#${PANEL_ID} h1{font-weight:600;font-size:13px}
#${PANEL_ID} button{cursor:pointer;padding:.1rem .45rem;border:1px solid #d0d0d0;border-radius:4px}
#${PANEL_ID} ol{display:block;padding:0;margin:0}
#${PANEL_ID} li{display:block;padding:.6rem .8rem;border-bottom:1px solid #f0f0f0}
#${PANEL_ID} .dh-sev{display:inline-block;padding:0 .4em;border-radius:3px;color:#fff;
 font:11px/1.6 ui-monospace,monospace}
#${PANEL_ID} .dh-id{font:11px/1.6 ui-monospace,monospace;color:#555}
#${PANEL_ID} .dh-msg{display:block;margin:.35rem 0}
#${PANEL_ID} .dh-fix{display:block;color:#1a7f37}
#${PANEL_ID} a{display:block;margin-top:.2rem;color:#2d7dd2;text-decoration:underline;
 font:11px/1.6 ui-monospace,monospace;cursor:pointer}
#${PANEL_ID} .dh-empty{display:block;padding:1rem .8rem}
`;

function render(findings: Finding[]): void {
  document.getElementById(PANEL_ID)?.remove();

  const panel = document.createElement("div");
  panel.id = PANEL_ID;

  const style = document.createElement("style");
  style.textContent = CSS;
  panel.append(style);

  const header = document.createElement("header");
  const title = document.createElement("h1");
  title.textContent =
    findings.length === 0
      ? "deadhead — nothing to cut"
      : `deadhead — ${findings.length} finding${findings.length === 1 ? "" : "s"}`;
  const close = document.createElement("button");
  close.textContent = "close";
  close.addEventListener("click", () => panel.remove());
  header.append(title, close);
  panel.append(header);

  if (findings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "dh-empty";
    empty.textContent = "No harmful, deprecated or unnecessary markup found in this document.";
    panel.append(empty);
  } else {
    const list = document.createElement("ol");
    for (const finding of findings) {
      const item = document.createElement("li");
      item.innerHTML =
        `<span class="dh-sev" style="background:${COLOUR[finding.severity]}">` +
        `${escape(finding.severity)}${finding.possible ? " · possible" : ""}</span> ` +
        `<span class="dh-id">${escape(finding.ruleId)}</span>` +
        `<span class="dh-msg">${escape(finding.message)}</span>` +
        `<span class="dh-fix">${escape(finding.replacement)}</span>` +
        `<a href="${escape(finding.url)}" target="_blank" rel="noreferrer">${escape(finding.url)}</a>`;
      list.append(item);
    }
    panel.append(list);
  }

  document.body.append(panel);
}

export function boot(rules: Rule[]): Finding[] {
  const findings = run(rules, fromDocument(document));
  render(findings);
  return findings;
}

// Not here yet: highlighting the offending element when you hover a row. It
// needs `Finding` to carry a handle back to the node, which the port does not
// expose and the CLI would have to leave null the way it leaves `range`. That
// is a change to a shared contract, so it belongs in its own pass rather than
// smuggled in behind a bookmarklet.
