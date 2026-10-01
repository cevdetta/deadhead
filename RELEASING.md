# Releasing

Both packages, `deadhead` and `eslint-plugin-deadhead`, are released together at
one version. A signed tag starts the Release workflow; it tests the packed
tarballs and **stages** them on npm through trusted publishing (OIDC, with
provenance). Nothing goes live until the maintainer approves each staged package
with 2FA. No npm token is ever created for this project.

## Every release

1. `node scripts/release.ts <patch|minor|major>`. It bumps both manifests and
   drafts a `CHANGELOG.md` section from the rules added, renamed or removed since
   the last tag. Edit the section, open the release PR, merge it.
2. From an up-to-date `main`:

   ```sh
   git switch main && git pull --ff-only
   git tag -s vX.Y.Z -m vX.Y.Z
   git push origin vX.Y.Z
   ```

3. Watch the Release workflow. It checks that the tag matches both manifests,
   runs the full chain, `pnpm check:packages` and the smoke test, then stages the
   exact tarballs the smoke test installed and creates the GitHub Release.
4. Approve, once per package, with 2FA:

   ```sh
   npm stage list
   npm stage view <stage-id>      # check name, version, file list
   npm stage approve <stage-id>
   ```

   `npm stage reject <stage-id>` drops a staged package instead.
5. Check both packages on npmjs.com (provenance shown, `latest` moved) and run
   `npx deadhead@X.Y.Z --version` in an empty directory.
6. Cloudflare Pages builds `main`, so the rule pages already match the release.

## First release: bootstrap (once)

npm lets a package use trusted publishing and staging only once it exists. So
each name is reserved by hand with a `0.0.0` placeholder, trusted publishing is
set up on it, and 0.1.0 goes through the workflow above like every later
release: built in CI, with provenance, approved with 2FA.

1. Check both names are still free: `npm view deadhead` and
   `npm view eslint-plugin-deadhead` must 404. If one is taken, stop and pick
   names before going on.
2. Publish the placeholders from your own machine, logged in to an npm account
   that has 2FA:

   ```sh
   npm login
   for name in deadhead eslint-plugin-deadhead; do
     dir=$(mktemp -d) && cd "$dir"
     printf '{ "name": "%s", "version": "0.0.0", "description": "Placeholder. Install %s@0.1.0 or later.", "license": "MIT", "repository": { "type": "git", "url": "git+https://github.com/cevdetta/deadhead.git" } }\n' "$name" "$name" > package.json
     printf '# %s\n\nPlaceholder that reserves the name. See https://deadhead.cevdet.ch.\n' "$name" > README.md
     npm publish --access public
     cd - >/dev/null
   done
   ```

3. On npmjs.com, for each package:
   - **Settings → Trusted publishing → GitHub Actions**: repository
     `cevdetta/deadhead`, workflow `release.yml`, environment `npm`, publishing
     mode **stage** (direct publishing off).
   - **Settings → Publishing access**: "Require two-factor authentication and
     disallow tokens".
4. The workflow runs in the GitHub environment `npm`, which the trusted
   publisher checks. GitHub creates it on the first run; create it beforehand
   under Settings → Environments only to add protection rules.
5. Tag `v0.1.0` from `main` and approve the two staged packages, as in "Every
   release" steps 2 to 5.
6. Deprecate the placeholders once 0.1.0 is live:

   ```sh
   npm deprecate deadhead@0.0.0 "Placeholder; use 0.1.0 or later."
   npm deprecate eslint-plugin-deadhead@0.0.0 "Placeholder; use 0.1.0 or later."
   ```

From 0.1.0 on, rule ids are permanent: a rename goes through
`scripts/rename-rule.ts` and leaves a redirect.
