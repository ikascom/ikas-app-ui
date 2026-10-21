---
"ikas-app-ui": minor
---

`@ikas/skeleton`: add `variant="shimmer"`, a light that sweeps across the block (a `::after` layer moved with `translate`, so it stays on the compositor; 1.5s sweep, 0.5s rest). The light is the new `--skeleton-shine` token and the `animate-skeleton-shimmer` utility ships with `@ikas/theme`. The default `pulse` is unchanged, and both variants now stop under reduced motion. Demos: basic and card (from shadcn), order list and a loading toggle.
