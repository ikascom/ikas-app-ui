# Contributing

Thanks for helping. This repo is a shadcn registry: it produces registry JSON, a
docs manifest and static previews that builders.ikas.com serves. Read the
[README](README.md) for the overview and the list of scripts; this file is the
detailed version.

## Setup

```sh
corepack enable          # uses the pnpm version pinned in package.json
pnpm install
pnpm dev                 # preview app on http://localhost:3001
```

Node 22 or newer is required.

## How the pieces fit

| Path | Role |
| --- | --- |
| `registry/` | The source that gets installed into apps. |
| `scripts/build-registry.mjs` | Generates `registry.json` from `registry/`. Dependencies are inferred from imports; titles, descriptions and categories come from its `meta` map. |
| `shadcn build` | Turns `registry.json` into `dist/r/<name>.json`. |
| `scripts/build-manifest.mjs` | Writes `dist/manifest/` (demo and example source, prop tables, item metadata) using the TypeScript compiler API. |
| `demos/`, `examples/`, `preview/` | Rendered by the preview app, exported to `preview/out` with base path `/ui-preview`. |
| `scripts/check-content.mjs` | Keeps sample content free of internal hosts, internal app names and third-party brands. |
| `scripts/smoke-install.mjs` | Installs every item into the ikas starter app with the real shadcn CLI and type-checks the result. |
| `scripts/health-check.mjs` | Mirrors shadcn's Registry Health check: `dist/r` hygiene, then a `--dry-run` install of every item in a bare project. |

Source files import each other through the aliases every shadcn project has.
`tsconfig.json` maps them onto this repo and the shadcn CLI rewrites them on install:

| Import | Here | In an app |
| --- | --- | --- |
| `@/components/ui/*` | `registry/ui/*` | `components/ui/*` |
| `@/components/ikas/*` | `registry/ikas/*` | `components/ikas/*` |
| `@/lib/*` | `registry/lib/*` | `lib/*` |
| `@/hooks/*` | `registry/hooks/*` | `hooks/*` |

## Adding a component

1. **Component.** Create `registry/ikas/<name>.tsx` for a screen pattern, or
   `registry/ui/<name>.tsx` for a primitive. The file name is the item name
   (`@ikas/<name>`), so pick it carefully: it is permanent.
   - Export the component and its props type: `export { Thing, type ThingProps }`.
   - Declare props as a `ThingProps` type and document each own prop with a
     JSDoc comment. `pnpm manifest:build` turns these into the docs prop table,
     with defaults taken from the destructuring in the function signature.
   - Use theme tokens (`bg-card`, `text-muted-foreground`, `var(--critical)` ...).
     Never hardcode colors; new tokens go in `registry/theme.css` only.
   - Keep visible default strings short; they ship to every app.
2. **Demo.** Add `demos/<name>/<variant>.tsx` with a default export, and register it
   in `demos/index.ts` as `"<name>/<variant>": Component`. The id is the file path
   and becomes the preview URL `/ui-preview/demo/<name>/<variant>`.
   `pnpm manifest:build` warns about demo files that are not registered.
3. **Metadata (required).** Add an entry to `meta` in `scripts/build-registry.mjs`:
   a `description` of at most 15 words saying what the item does for an app
   built on ikas (plain English, no marketing words), and 1–2 `categories` from
   the `CATEGORIES` list at the top of the script. `title` is optional (defaults
   to the file name). `pnpm registry:build` fails if the entry is missing, the
   description is too long, or a category is not in the list.
4. **Build and test.** Run the [checklist](#before-you-open-a-pr) below.
   Commit the regenerated `registry.json`; CI fails if it is out of date.
5. **Changeset.** `pnpm changeset`, then describe the change for app developers.

## Before you open a PR

Run these in order; each must pass.

```sh
pnpm lint
pnpm typecheck
pnpm check:content
pnpm build               # registry:build + manifest:build + preview:build
pnpm registry:validate
pnpm smoke               # install into the ikas starter app and type-check
pnpm health              # shadcn Registry Health mirror (dry-run install of every item)
pnpm changeset           # if the change affects anything users install
```

Then commit the regenerated `registry.json` together with your change.

### The smoke test

`pnpm smoke` needs `dist/r` (run `pnpm registry:build` first). It serves `dist/r`
on a free local port, copies the ikas starter app to a temp directory, runs
`shadcn registry add`, installs `@ikas/theme` and then every other item with
`--overwrite --yes`, checks every item's file and every theme token landed, and
runs `tsc --noEmit`. It fails on type errors in installed files or in the app's
`components/` and `hooks/`; errors elsewhere in the starter app are ignored.

| Option | Effect |
| --- | --- |
| `IKAS_STARTER_DIR=/path` | Use a local starter app copy instead of cloning `ikascom/ikas-app-examples`. |
| `SHADCN_VERSION=x.y.z` | Pin the shadcn CLI version (default `latest`). |
| `--keep` | Keep the temp app for inspection. |
| `--next-build` | Also run `next build`. |

### The health check

`pnpm health` needs `dist/r` (run `pnpm registry:build` first). It mirrors the
weekly [shadcn Registry Health](https://ui.shadcn.com/docs/registry) check so
problems show up here first:

- **Hygiene:** every `dist/r/<name>.json` has `name` equal to its file name;
  `dist/r/registry.json` is named `ikas`, has unique item names and no inlined
  `files[].content`.
- **Installability:** in a bare temp project (`package.json`, a minimal
  `tsconfig.json`, `components.json` with style `radix-vega`, an empty
  `app/globals.css`, aliases `@/components`, `@/lib`, `@/hooks`,
  `@/components/ui`), runs `shadcn add @ikas/<item> --dry-run --yes` for every
  item against a local server for `dist/r`, with a 60s timeout each.

| Option | Effect |
| --- | --- |
| `SHADCN_VERSION=x.y.z` | Pin the shadcn CLI version (default `latest`). |
| `HEALTH_CONCURRENCY=n` | Items checked in parallel (default 4). |
| `--keep` | Keep the temp project for inspection. |

## Breaking-change policy

Apps copy these components into their own code and builders.ikas.com links to
them, so the following are a **permanent public contract**:

- item names (`@ikas/<name>`) and their `/r/{name}.json` paths,
- `/ui-preview/...` paths (embedded in docs),
- CSS token names in `registry/theme.css` (`--critical`, `--shadow-raised`, ...),
- exported component and prop names.

Rules:

- **Deprecate before removing.** Mark the prop, export or token with a
  `@deprecated` JSDoc comment (or a CSS comment for tokens) that names the
  replacement, and keep it working for at least one minor release before removal.
  Removal is a major bump.
- **Totally new API, new item.** If a redesign cannot stay compatible, ship it
  under a new name (for example `resource-table-v2`) and deprecate the old item
  instead of changing it in place.
- Additive changes (new optional props, new tokens, new items) are minor.

## Releases

Nothing is published to npm. Changesets is used only for versioning and the changelog.

| Bump | When |
| --- | --- |
| patch | Bug fixes, visual polish |
| minor | New items, props or tokens; deprecations |
| major | Removals or renames covered by the policy above |

1. Each PR that changes installable code adds a changeset (`pnpm changeset`).
2. On every push to `main`, `.github/workflows/release.yml` runs `changesets/action`,
   which opens or updates a "Version packages" PR (version bump + `CHANGELOG.md`).
3. When that PR is merged, the workflow sees an untagged version, runs `pnpm build`,
   packs `r/`, `ui-preview/` and `manifest/` into `ikas-app-ui-v<version>.tar.gz`,
   and creates the GitHub release and tag `v<version>`.
4. Update builders.ikas.com by hand (below).

### Update builders.ikas.com

builders.ikas.com serves a pinned release, so each release needs a PR on
`ikascom/ikas-builders`. (The `bump-builders` job in `release.yml` only runs
when a `BUILDERS_APP_ID` GitHub App secret is configured, which it is not.)

1. In `ikascom/ikas-builders`, bump the ui-kit version file (name planned) to
   the new tag, `v<version>`.
2. Run the sync script, `scripts/sync-ui-kit.mjs` (planned). It downloads
   `ikas-app-ui-v<version>.tar.gz` from the GitHub release and unpacks it into
   `public/r`, `public/ui-preview` and `.ui-kit/manifest`.
3. Add or adjust the MDX docs pages for new or renamed items.
4. Open a PR. After it deploys, check that
   `https://builders.ikas.com/r/registry.json` returns `200` with
   `content-type: application/json`:
   ```sh
   curl -sSI https://builders.ikas.com/r/registry.json | grep -iE '^(HTTP|content-type)'
   ```

## CI

> Parked: `ci.yml` and `release.yml` currently live in `.github/workflows-disabled/` so pushes don't trigger them. See the README there to enable.

`.github/workflows/ci.yml` runs on every PR and push to `main` with read-only
permissions and no secrets: lint, typecheck, `check:content`, `registry:build`
(and fails if `registry.json` changed), `registry:validate`, `manifest:build`,
`preview:build`, the smoke test, the registry health check, and a gitleaks
secret scan. Please run the [checklist](#before-you-open-a-pr) locally before
opening a PR.

### Maintainers: secret scanning

- Enable GitHub secret scanning and push protection in the repo settings
  (Settings > Code security).
- Before making the repo public, run a one-time scan of the full history:
  ```sh
  docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest git /repo
  # or, with gitleaks installed:
  gitleaks git .
  ```

## Pull requests

- Keep PRs focused: one component or one fix.
- Include screenshots for visual changes, in light and dark.
- Sample content (demos, examples) must stay generic: no real store, app,
  marketplace or brand names. `pnpm check:content` enforces the basics.
- By contributing you agree your contribution is licensed under the [MIT License](LICENSE).

## Brand assets

`assets/brand/` (logos, PNG sizes, favicon, social preview, shadcn directory entry) is generated by `pnpm brand:build` from the geometry in `scripts/build-brand.mjs`. Rendering PNGs needs a local Chrome (`CHROME_PATH` to override); `pnpm brand:build -- --svg-only` regenerates only the SVGs. The preview app's `preview/app/icon.svg`, `apple-icon.png` and `favicon.ico` are copies from that folder. Run it only when the mark changes and commit the output. Usage rules: [`assets/brand/README.md`](assets/brand/README.md).

## Security

Do not open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).
