---
"ikas-app-ui": minor
---

Add `@ikas/breadcrumb`: shadcn/ui's composable breadcrumb (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink` with `asChild` on Radix `Slot`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`) in the ikas style, plus a `separator` prop on `Breadcrumb` that changes every separator in the trail at once (a separator's own children still override it): 13px muted trail, the current page in medium weight, chevron separators; a link or page holding an icon lines it up before the label. Demos adapted from shadcn's examples: basic with a collapsed menu, separator switcher, icons, dropdown item, collapsed, router link, responsive (menu on desktop, drawer on phones) and in-page above a `PageHeader`. `ikas-ui.md` places it above `PageHeader` on screens more than two levels deep.
