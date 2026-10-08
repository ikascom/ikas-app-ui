# Security policy

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Email **security@ikas.com** with:

- a description of the issue and its impact,
- steps or code to reproduce it,
- the affected item(s) (`@ikas/<name>`) and version, if known.

We will acknowledge your report, keep you updated while we investigate, and
credit you in the release notes if you wish.

## Scope

This repository contains UI component source that is copied into apps with the
shadcn CLI, plus the build output served from `builders.ikas.com/r` and
`builders.ikas.com/ui-preview`. In scope:

- vulnerabilities in component source (for example XSS through props that render HTML),
- issues in the build or release tooling of this repository.

Issues in the ikas platform, the Admin API or `@ikas/*` npm packages are out of
scope here; report them to the same address and mention the product.

## Supported versions

Only the latest release is supported. Because components are copied into your
project, updating means re-running `npx shadcn@latest add @ikas/<name> --overwrite`
(review the diff before committing).
