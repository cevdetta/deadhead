Closes #

## Rule

- ruleId: <!-- namespace/name; must match the file path -->

## Definition of done

- [ ] Frontmatter validates (`pnpm validate:rules`), and `ruleId` matches the file path
- [ ] At least two independent sources under `## Resources`
- [ ] `## Why avoid` (or `## Why use`) states the concrete consequence, not just "it's old"
- [ ] `## Use instead` has runnable markup, or explicitly says "delete it"
- [ ] `severity` is justified: `harmful` breaks something for users; `deprecated` is
      formally obsolete but inert; `unnecessary` works but is dead weight
- [ ] Fixtures pass in all three adapters (conformance suite)

## Notes for the reviewer

<!-- Consequence summary, evidence assessment, anything uncertain. -->
