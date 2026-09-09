/** Machine-readable output for anything that is not GitHub code scanning. */

import { type Reporter, tally, total } from "./index.ts";

export const json: Reporter = (results) =>
  `${JSON.stringify(
    {
      version: 1,
      summary: { findings: total(results), ...tally(results) },
      results: results.map(({ file, findings }) => ({ file, findings })),
    },
    null,
    2,
  )}\n`;
