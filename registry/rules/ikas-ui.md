# ikas App UI rules

These rules apply to every screen of this ikas app. The app opens inside the ikas admin panel;
its screens must use the same type scale, density and surfaces as the panel and must not look
like generic AI output. Follow these rules whenever you write or change UI code.

## You are inside the panel

The panel's top bar is already there: back button, app logo, app name and "Manage plan". The app draws
none of these: no logo, no app name, no top bar of its own, no sidebar, no plan/subscription button.
The `PageHeader` title is the name of the screen or section ("Shipments", "Settings"), not the app's name.
An app with several sections switches between them with `PageNav` (the first child of `Page`, at most 6 sections).

## 1. Use the building blocks, don't reinvent them

| Need | Use | Never |
| --- | --- | --- |
| Screen wrapper + title + actions | `Page` + `PageHeader` from `@/components/ikas/page` | A custom `<div className="container">` with an `<h1>` |
| Switching sections (multi-section app) | `PageNav` from `@/components/ikas/page-nav` (`href` with a router, `value` + `onValueChange` on a single page) | A sidebar, a top bar of its own, a logo + app name header |
| The path to a deep record (list → record → sub-record) | `Breadcrumb` above `PageHeader` (last item `BreadcrumbPage`, `BreadcrumbEllipsis` in the middle of a long path) | Links joined with `/` by hand, a path starting with the app's name |
| Switching views inside a card or table | `SegmentedControl` (`size="sm"` in a card header) or `Tabs` | Two nested rows of pill tabs |
| Columns | `Layout` / `LayoutColumn` (`columns="main-aside"`, `"half"`, `"third"`) | Hand-written `grid-cols-*` on every page |
| Settings forms | `SettingsGroup` (`label`, `hint`, `index` on long pages) + `Card` + `Field` | One huge form in a single centered card |
| Record list | `RecordTable` | A grid of cards for tabular data |
| Nothing to show | `EmptyState` | A grey "No data" line |
| Feature outside the plan (locked) | `FeatureGate` (`variant="overlay"` over a list/card, `"banner"`, `"inline"`, `"action"` for a single button; `plan`, `onUpgrade`) | An `EmptyState` saying "Upgrade to Pro", a custom lock card, a grey `disabled` button |
| A list or section failed to load | `RecordTable error` + `onRetry`; in a section, `EmptyState status="danger"` + `onRetry` | An empty table, plain red text |
| Persistent feedback | `Banner` with `status` | Colored `<div>`s, emoji, alert() |
| Transient feedback | `toast` from the `sonner` package; `Toaster` from `@/components/ui/sonner` once at the root | A banner for "Saved!" |
| Unsaved form changes | `UnsavedBar` | A Save button at the bottom of a long form |
| Status | `Badge` with `status` (+ `dot` for live states) | Custom colored pill labels |
| Changing status (pending → syncing → done) | `AnimatedBadge` (`status`, `media="dot"` + `pulse` for live) | A blinking `Badge`, custom keyframes |
| Actions | `Button` with `variant` + `color` | Custom `<button>` styles, extra shadows |
| Icon-only button | `Button size="icon"` + `aria-label` + `Tooltip` (`TooltipContent shortcut` when there is a shortcut), one `TooltipProvider` at the root | An unlabelled icon, a `title` attribute, an arrow or custom delay on the tooltip |
| Key numbers | `StatCard` | Huge hero numbers with gradient text |
| Key/value details | `DescriptionList` | Hand-aligned flex rows |
| A single on/off setting | `SettingRow` | A label + switch in an ad-hoc flex |
| Color input | `ColorPicker` inside a `Field` (`value`/`onValueChange` give hex; saved colors with `swatches`) | `<input type="color">`, a hand-written hex field |
| Light/dark appearance choice | `ThemeSwitch` (`theme`, `onThemeChange`, `transition`) | A hand-written sun/moon button, a custom page transition |
| Toggleable feature + its settings | `ToggleSection` | A settings form always visible next to the switch |
| Onboarding steps | `Launchpad` (`eta` per step, `requires` when order matters) | "Do this first" banners scattered across the screen |
| Install/update/remove a storefront script | `ScriptInstaller` | A hand-written install button, removal without confirmation |
| Chart frame (title, value, range) | `ChartCard` | A custom card header for each chart |

Before writing your own, install the missing piece with `npx shadcn@latest add @ikas/<name>`.

## 2. Visual rules

- **Colors come only from tokens.** Use `bg-card`, `text-muted-foreground`,
  `bg-success-subtle`, `border-border` and so on. Never write hex values, `bg-blue-500`,
  `text-gray-600` or any raw Tailwind palette color in app code.
- **Depth comes from the components.** Solid buttons ship with an inner highlight and a soft glow;
  cards and outline buttons ship with layered thin shadows. Never add your own gradients, glows,
  `shadow-lg`/`shadow-2xl`, gradient text or colored backgrounds.
- **No decorative emoji:** not in headings, buttons, badges or empty states. Use lucide icons.
- **One solid button per screen section.** Other actions are `outline`, `soft` or `ghost`.
  The solid button is the last item in the action group.
- **Neutral by default.** Buttons are `color="neutral"` unless the color carries meaning:
  `red` for irreversible confirmations, a single accent color (e.g. `blue`) for the app's main call to action.
  Never mix more than one accent color on the same screen.
- **Status colors have meaning.** `status` values: `success` = done/healthy,
  `warning` = needs attention soon, `danger` = broken/blocked/irreversible, `info` = informational,
  `neutral` = no status. Don't use them for decoration.
- **Don't color toasts; the status does.** `toast.success/info/warning/error` is enough: the icon (plus a thin
  border on warning and error) carries the status. For more prominent toasts, use `<Toaster variant="soft" />` in one place; never
  color individual toasts with `className`.
- **Don't color banner actions; the banner does.** Don't give `color` to buttons in `Banner` `actions`:
  in a soft banner, default-colored buttons take the status color on their own (solid → status fill,
  outline/soft/ghost → tinted). Don't add classes like `text-amber-*` or `bg-red-*` to the text or buttons by hand.
- **Surfaces:** light theme first. Page background is `bg-background`; content sits on a `Card`
  (white, layered thin shadow). No `backdrop-blur`, glassmorphism or colored card backgrounds.
- **Corner radius:** use the component defaults. Don't add `rounded-2xl`/`rounded-3xl`.
- **Typography:** `PageHeader` sets the page title (20px semibold). Card titles are 15px semibold.
  Body is 14px. Never use `text-4xl`+ anywhere in the app; no ALL CAPS labels and no `tracking-widest`.
- **Density:** this is an admin tool. Controls are 36px (`h-9`). Don't inflate spacing
  (`p-10`, `py-24`) and don't build landing-page-style hero sections.
- **Navigation hierarchy:** level 1 is `PageNav` (underlined bar at the top of the page), level 2 is
  `SegmentedControl` / `Tabs` (pills) in a card header or toolbar. Never nest two pill rows or two underlined bars.
  If you need a third level, change the design: split into separate screens, use `Collapse` or `Select`.
- **Icons:** lucide-react; 16px in controls, at most 20px elsewhere. Icons support text;
  they never replace the label on the main action.

## 3. Copy rules

- Sentence case everywhere: "Create campaign", not "Create Campaign".
- Button copy says what will happen: "Save settings", "Export orders". Never write a bare "Submit",
  "OK" or "Click here".
- An empty state says why there is nothing on the screen and offers a single next step. No jokes, no "Oops!".
- Error copy gives the consequence first (what wasn't saved, what wasn't sent), then the fix. Never show
  merchants a raw error object or stack trace; if an error code is needed, add it in monospace.
- Write for merchants in the app's language (Turkish apps: Turkish copy; format numbers and
  currency with `Intl.NumberFormat` and `tr-TR`).

## 4. States are not optional

Every data-driven screen covers: **loading** (skeletons with `RecordTable loading` or `Skeleton`,
not a spinner in the middle of the page), **empty** (`EmptyState`), **error**
(in place, as in section 1; `Banner status="danger"` with a retry action if the rest of the page works)
and **success** (`toast`).
**Locked** is not empty: a feature outside the plan is locked with `FeatureGate`, not explained with `EmptyState`;
the content stays visible but can't be clicked.

## 5. Page recipes

- **Multi-section app:** `Page` → `PageNav` at the top (≤ 6 sections) → `PageHeader` (the section's name) →
  the section's content (one of the recipes below). No sidebar, no app name.
- **List page:** `Page width="wide"` → `PageHeader` (title, main action) →
  `RecordTable` with a toolbar (search + filters), pagination and bulk actions.
- **Detail page:** `Page` → `Breadcrumb` when deeper than two levels → `PageHeader` (`back`, `badges`, actions) →
  `Layout columns="main-aside"` → main column: content cards; side column: `DescriptionList` cards.
- **Settings page:** `Page width="narrow"` → `PageHeader` → stacked `SettingsGroup`s, each holding
  a single `Card` → `UnsavedBar` bound to the form's dirty state. With more than four groups,
  `Page` + a sticky section menu on the left and numbers like `index="01"` on the groups.
- **App home (onboarding):** `Page width="wide"` → `PageHeader` → `Launchpad` at the top
  → metrics and an `EmptyState` for the first record. Once every step is done it can be removed with `onDismiss`.
- **Dashboard:** `Page width="wide"` → `Layout columns="third"` of `StatCard`s → tables / cards.

## 6. Motion

- Don't hand-write springs or curves: use `@/lib/motion` (`SPRING`, `ICON_SPRING`, `EASE_*`, `springOrInstant`)
  or tokens like `ease-(--ease-out)` in CSS.
- Hover 150ms, content enter 150ms / exit 100ms, overlay 300/200ms. Exit is shorter than enter.
- `transition-all` is banned. In Tailwind v4, for `translate-*` / `scale-*` list
  `translate` and `scale` in the transition property (not `transform`).
- For icon micro-animations, give the icon `data-anim="spin|nudge|lift|drop|ring|wiggle|bounce|pop"`;
  don't write your own keyframes.
- For a badge whose status changes, use `AnimatedBadge`; the label and icon flow on their own. It doesn't play on first render.
- Use `PageNav` for sections, `SegmentedControl` for in-card tabs / single choice, `NumberStepper` for number input,
  `Collapse` for expandable sections, `ConfirmButton` for inline destructive confirmation.
- Every animation needs a reduced-motion fallback (`springOrInstant(useReducedMotion())`, `motion-reduce:*`).

## 7. Charts

- Build charts with `AreaChart`, `BarChart`, `DonutChart`, `BarList`, `Sparkline`, `Meter`.
- A single series uses `--chart-ink`; multiple series use `--chart-1…6` in order. Don't pick colors by hand or cycle them;
  more than 6 series are grouped under "Other". Status colors are not series colors.
- One y-axis. Two measures on different scales get two charts.
- Thin marks: 2px lines, ≤ 24px bars, 4px rounded ends, thin horizontal grid. Values and labels use text tokens.
- A legend is required for 2+ series. Don't label every point; provide a tooltip and, when needed, a table view.
- If you need a single headline number, use a `StatCard`, not a chart.
