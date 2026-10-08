<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/brand/logo-white.svg">
    <img src="assets/brand/logo-black.svg" alt="ikas App UI" width="64" height="64">
  </picture>
</p>

UI components and screen patterns for building apps on ikas. A shadcn registry for any developer publishing to the ikas App Store.

```sh
npx shadcn@latest add @ikas/theme @ikas/page
```

Until `@ikas` is listed in the shadcn registry index, register it once in your project first:

```sh
npx shadcn@latest registry add "@ikas=https://builders.ikas.com/r/{name}.json"
```

**Docs, props and live previews:** https://builders.ikas.com/tr/docs/app-development/ui-kit

## What's inside

| Item | What you get |
| --- | --- |
| `@ikas/theme` | Light-first neutral theme as CSS variables: surfaces, a six-color palette, status colors (info, success, warning, danger), radius and elevation. Install it first. |
| `@ikas/<primitive>` | shadcn/ui primitives restyled for ikas: `button`, `badge`, `card`, `field`, `input`, `select`, `dialog`, `sheet`, `table`, `tabs`, `tooltip` and more. |
| `@ikas/<pattern>` | Screen patterns for app UIs: `page`, `layout`, `record-table`, `unsaved-bar`, `setting-row`, `banner`, `empty-state`, `stat-card`, `description-list`, `launchpad`, `script-installer`, charts (`area-chart`, `bar-chart`, `donut-chart`, `sparkline`, ...) and motion helpers. |
| `@ikas/ui-rules` | `ikas-ui.md`, design rules for AI coding agents. Reference it from your `AGENTS.md` / `CLAUDE.md`. |

The full list lives in [`registry.json`](registry.json). Components are copied into your project as source (`components/ui`, `components/ikas`, `lib`), so you own and can edit them.

### Principles

- **Native to the ikas panel.** Store owners open your app inside the ikas admin. Using the panel's type scale, density and surfaces makes your screens read as panel screens, not an embedded website.
- **Decisions, not options.** Each component carries a decision: where the primary action goes, what an empty table says. Variants exist for real needs, not taste.
- **Status colors mean something.** Green is done, amber needs attention soon, red is broken or irreversible, blue is information. Color is never decoration.
- **Quiet surfaces, loud content.** Neutral colors, white cards, soft shadows. Depth only where you can click.
- **Every state is designed.** Loading, empty, error and success are part of the component, not left to each app.
- **The code is yours.** Components are copied into your app by the shadcn CLI. Change them when you need to; the defaults are a strong start.

Full docs, guidelines and live previews: [builders.ikas.com](https://builders.ikas.com/tr/docs/app-development/ui-kit).

### These are not npm packages

`@ikas/...` here are shadcn registry addresses, installed with the shadcn CLI. Do not `npm install` them. npm has real, unrelated `@ikas` packages, such as `@ikas/admin-api-client` and `@ikas/app-helpers`, which you use for the ikas Admin API and app helpers.

## Contributing / development

Requires Node 22+ and pnpm (the version is pinned in `package.json`; run `corepack enable`). The detailed guide is [CONTRIBUTING.md](CONTRIBUTING.md); run its [Before you open a PR](CONTRIBUTING.md#before-you-open-a-pr) checklist before every PR.

```sh
pnpm install
pnpm dev          # preview app on http://localhost:3001
```

### Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Runs the preview app (`preview/`) with every demo and example on port 3001. |
| `pnpm build` | Full build: `registry:build` + `manifest:build` + `preview:build` + `thumbnails:build`. |
| `pnpm registry:build` | Regenerates `registry.json` from `registry/` (`scripts/build-registry.mjs`), then `shadcn build` writes one JSON per item to `dist/r/`. Fails if an item has no description or categories in `meta`. Commit `registry.json`. |
| `pnpm registry:validate` | `shadcn registry validate`: checks `registry.json` against the shadcn schema. |
| `pnpm manifest:build` | Writes `dist/manifest/*.json` (demo and example source, prop tables, item metadata) for the docs site. Needs `registry.json`. |
| `pnpm preview:build` | Static export of the preview app to `preview/out/` (served under `/ui-preview`). |
| `pnpm thumbnails:build` | Screenshots every example, demo and embed in `preview/out/` with headless Chrome and writes `dist/thumbnails/` (WebP images + `index.json` with sizes and natural heights). Needs `preview:build` first. Skips with a message when Chrome is not found (`CHROME_PATH` to override, `--strict` to fail instead). |
| `pnpm typecheck` | `tsc --noEmit` over registry, demos, examples and preview. |
| `pnpm lint` | ESLint. |
| `pnpm check:content` | Fails on internal hosts, internal app names or third-party brands in public sample content. |
| `pnpm smoke` | Install smoke test: serves `dist/r` locally, installs every item into a fresh copy of the [ikas starter app](https://github.com/ikascom/ikas-app-examples/tree/main/examples/starter-app) with the shadcn CLI and type-checks it. Run `pnpm registry:build` first. |
| `pnpm health` | Mirrors shadcn's Registry Health check: `dist/r` hygiene, then `shadcn add @ikas/<item> --dry-run --yes` for every item in a bare `radix-vega` project. Run `pnpm registry:build` first. |
| `pnpm brand:build` | Regenerates `assets/brand/` (SVG logos, PNG sizes, `favicon.ico`, social preview) from `scripts/build-brand.mjs`. Needs Chrome for PNGs; `--svg-only` skips them. Only when the mark changes. |
| `pnpm changeset` | Adds a changeset describing your change (see [Releases](#releases)). |

`pnpm smoke` options:

| Option | Effect |
| --- | --- |
| `IKAS_STARTER_DIR=/path/to/starter-app` | Copy a local starter app instead of cloning `ikascom/ikas-app-examples`. The source is never modified. |
| `SHADCN_VERSION=4.21.3` | shadcn CLI version to install with (default `latest`). |
| `--keep` | Keep the temporary app and print its path, for inspection. |
| `--next-build` | Also run `next build` in the app. |

### Build output and how builders.ikas.com uses it

This repo only produces build output. The docs site lives in a separate repo (ikas-builders) which serves it.

| Output | Contents | Served at |
| --- | --- | --- |
| `dist/r/` | One JSON per registry item (`theme.json`, `page.json`, ...) | `https://builders.ikas.com/r/{name}.json` |
| `dist/manifest/demos.json` | `{ "<demo id>": { code } }`, source shown next to each preview | Read by the docs pages at build time |
| `dist/manifest/examples.json` | `{ "<slug>": { title, description, code } }` for full screen examples | Read by the docs pages at build time |
| `dist/manifest/props.json` | Props per component: name, type, optional, default, description | Prop tables in the docs |
| `dist/manifest/items.json` | Item metadata from `registry.json` plus the package version | Component index in the docs |
| `preview/out/` | Static preview pages: `/demo/<id>`, `/embed/<name>`, `/<example>`. `?theme=light\|dark` (default light) picks the theme before first paint, and a `{ type: "ikas-ui:theme", theme }` message from the parent switches it live; demos also take `?align=center\|start\|stretch` | `https://builders.ikas.com/ui-preview/*` (embedded as iframes that follow the docs theme) |
| `dist/thumbnails/` | `examples/<slug>.webp`, `demos/<id>.webp`, `embeds/<name>.webp`, a dark variant of each (`<same>.dark.webp`) and `index.json` (`{ file, dark, width, height, naturalHeight }` per entry, plus `content` for demos) | `https://builders.ikas.com/ui-kit-thumbs/*` (index cards, iframe placeholders and reserved heights, light or dark with the docs theme) |

Each release attaches them as `ikas-app-ui-v<version>.tar.gz` (`r/`, `manifest/`, `ui-preview/`, and `thumbnails/` when they were built); builders.ikas.com pins the version it serves.

### Adding a component

| Step | Where |
| --- | --- |
| 1. Write the component | `registry/ikas/<name>.tsx` (patterns) or `registry/ui/<name>.tsx` (primitives). Import siblings via `@/components/ui/*`, `@/components/ikas/*`, `@/lib/*`. Use theme tokens, never raw colors. |
| 2. Add a demo | `demos/<name>/<variant>.tsx`, registered in `demos/index*.ts` as `"<name>/<variant>"`. |
| 3. Metadata (required) | In the `meta` map of `scripts/build-registry.mjs`: a description (≤ 15 words) and 1–2 categories from `CATEGORIES`. |
| 4. Build and test | The [Before you open a PR](CONTRIBUTING.md#before-you-open-a-pr) checklist. Commit `registry.json`. |
| 5. Changeset | `pnpm changeset` (minor for a new item). |

Item names, `/r/{name}.json` and `/ui-preview` paths and CSS token names are a permanent public contract. See the [breaking-change policy](CONTRIBUTING.md#breaking-change-policy).

### Releases

Nothing is published to npm; changesets is used only for versioning and `CHANGELOG.md`.

1. PRs that change installable code include a changeset (`pnpm changeset`).
2. On `main`, the Release workflow opens a "Version packages" PR that bumps the version and updates `CHANGELOG.md`.
3. Merging it builds everything and creates the GitHub release `v<version>` with `ikas-app-ui-v<version>.tar.gz` attached.
4. builders.ikas.com is then updated by hand: see [Update builders.ikas.com](CONTRIBUTING.md#update-buildersikascom).

### CI

> The workflows are parked in [`.github/workflows-disabled/`](.github/workflows-disabled) during setup and don't run yet. Move them to `.github/workflows/` to enable.

Every PR and push to `main` runs, with read-only permissions and no secrets:

| Job | Checks |
| --- | --- |
| Lint, typecheck, build | `lint`, `typecheck`, `check:content`, `registry:build` with `registry.json` up to date, `registry:validate`, `manifest:build`, `preview:build` |
| Install smoke test | `registry:build` + `smoke` against the ikas starter app |
| Registry health | `registry:build` + `health` (shadcn Registry Health mirror) |

## Repo layout

| Path | Contents |
| --- | --- |
| `registry/theme.css` | Theme tokens (the only place colors, radii and shadows are defined) |
| `registry/ui/` | Primitives, installed to `components/ui` |
| `registry/ikas/` | Screen patterns, installed to `components/ikas` |
| `registry/lib/`, `registry/hooks/` | Shared helpers, installed to `lib` / `hooks` |
| `registry/rules/ikas-ui.md` | UI rules for AI agents (`@ikas/ui-rules`) |
| `demos/` | One file per demo, registered in `demos/index*.ts` |
| `examples/` | Full example screens, registered in `examples/index.ts` |
| `preview/` | Next.js app that renders demos and examples (static export) |
| `scripts/` | Registry, manifest, thumbnails, content check, smoke, health and brand scripts |
| `assets/brand/` | Logo pack: SVGs, PNGs (16–1024px), `favicon.ico`, social preview, shadcn directory entry |
| `registry.json` | Generated registry index (committed) |
| `.changeset/` | Pending changesets |

## Brand assets

The mark is the ikas Builders symbol on a rounded tile. Everything in [`assets/brand/`](assets/brand) is generated by `pnpm brand:build`; see [`assets/brand/README.md`](assets/brand/README.md) for which file to use where.

## License

[MIT](LICENSE). The license covers the code in this repository. It does not grant rights to the ikas name, logo or other trademarks.
