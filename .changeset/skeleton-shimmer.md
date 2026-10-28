---
"ikas-app-ui": minor
---

`@ikas/skeleton`: add `variant="shimmer"`, a light that sweeps across the block (a `::after` layer moved with `translate`, so it stays on the compositor; 1.5s sweep, 0.5s rest). The light is the new `--skeleton-shine` token and the `animate-skeleton-shimmer` utility ships with `@ikas/theme`. Placeholders get their own `--skeleton` color (`bg-skeleton`), darker than `--muted` in the light theme so they read on both the page and a card; Skeleton and the BarChart/AreaChart loading states use it. The default `pulse` is unchanged, and both variants now stop under reduced motion. Demos: basic and card (from shadcn), order list and a loading toggle, each with a pulse/shimmer switch.

`@ikas/skeleton` now depends on `@ikas/theme`. Reinstall `@ikas/theme` (`npx shadcn@latest add @ikas/theme`) in an app that installed the theme earlier, or skeletons don't show.
