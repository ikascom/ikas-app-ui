# Changesets

This folder holds pending changesets: small Markdown files that describe a change
and how it bumps the version. Add one with every PR that changes something people
install from the registry:

```sh
pnpm changeset
```

Pick the bump (`ikas-app-ui` is the only package) and write one or two sentences
for the changelog, written for app developers who use the components.

| Bump  | When |
| ----- | ---- |
| patch | Bug fixes, visual polish, docs-only changes to an item |
| minor | New items, new props, new tokens, deprecations |
| major | Removing or renaming an item, prop or CSS token (see the breaking-change policy in CONTRIBUTING.md) |

Nothing is published to npm. On `main`, the Release workflow collects pending
changesets into a "Version packages" PR. Merging that PR bumps `package.json`,
updates `CHANGELOG.md`, and creates a GitHub release `v<version>` with the build
output attached (`ikas-app-ui-v<version>.tar.gz`). See CONTRIBUTING.md for the
full release flow.
