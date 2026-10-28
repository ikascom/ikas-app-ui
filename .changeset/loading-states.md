---
"ikas-app-ui": minor
---

One loading logic across components, after Radix Themes.

- `@ikas/skeleton`: `loading` wraps real content (`<Skeleton loading={isLoading}><span>…</span></Skeleton>`); the content keeps its size and shape, can't be reached, and shows when `loading` is false. A Skeleton without children works as before.
- `@ikas/skeleton`: `SkeletonProvider variant="pulse" | "shimmer"` sets the look once; `useSkeletonVariant` reads it.
- `@ikas/chart-kit`: `ChartLoading` (BarChart and AreaChart `loading`) follows the provider and draws in `--skeleton` like Skeleton. It pulses by default instead of its own shimmer; set `SkeletonProvider variant="shimmer"` for the old feel. The `chart-shimmer` keyframes are deprecated.
- `@ikas/skeleton` and `@ikas/chart-kit` (and so BarChart and AreaChart) now depend on `@ikas/theme` for `--skeleton` and the shimmer. Reinstall `@ikas/theme` (`npx shadcn@latest add @ikas/theme`) in an app that installed the theme earlier, or placeholders don't show.
- New `@ikas/use-delayed-loading`: skips placeholders for loads under 300 ms and keeps a shown one for at least 400 ms.
- `@ikas/ui-rules`: loading rules (action → `Button loading`, data → component `loading` or wrapped Skeleton, one provider, `aria-busy` once per region).
- Demos: skeleton provider; the loading demo now wraps the real orders.
