---
"ikas-app-ui": minor
---

Add `@ikas/page-nav`: a second-level section bar for multi-section apps, sitting under the panel's own top bar as the first child of `Page`. Links via `linkComponent` (router apps) or tabs via `value` / `onValueChange` (one-page apps), sliding underline, sticky, scrolls on small screens. `ikas-ui.md` gains the "Panelin içindesin" rules: no app logo, app name, own top bar or sidebar, and a navigation hierarchy (PageNav above, SegmentedControl / Tabs inside cards, never two nested pill rows). The e-invoice example now switches sections with PageNav.
