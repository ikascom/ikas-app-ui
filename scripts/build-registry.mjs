#!/usr/bin/env node
/**
 * Generates registry.json from registry/. `shadcn build` then writes one JSON
 * per item to dist/r, which builders.ikas.com serves at /r/{name}.json.
 *
 *   registry/theme.css        -> @ikas/theme  (cssVars light/dark/theme + raw CSS)
 *   registry/lib/*.ts         -> @ikas/<name> (registry:lib)
 *   registry/ui/*.tsx         -> @ikas/<name> (registry:ui)
 *   registry/ikas/*.tsx       -> @ikas/<name> (registry:component, components/ikas)
 *   registry/hooks/*.ts       -> @ikas/<name> (registry:hook)
 *   registry/rules/ikas-ui.md -> @ikas/ui-rules (registry:file)
 *
 * Source files import each other through the aliases every shadcn project has
 * (@/components/ui, @/lib, @/hooks); tsconfig maps them onto registry/ here and
 * the shadcn CLI rewrites them to the consumer's aliases on install.
 *
 * Dependencies are inferred from imports, so the only thing to maintain by
 * hand is the metadata map below (title, description and categories per item;
 * the build fails if an item is missing from it).
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const read = (p) => fs.readFileSync(path.join(root, p), "utf8")
const NAMESPACE = "@ikas"
const DOCS = "https://builders.ikas.com/tr/docs/app-development/ui-kit"

/** Builders has a page per pattern; primitives without one point at the overview. */
const docsPages = new Set(
  fs.existsSync(path.join(root, "registry/ikas"))
    ? fs.readdirSync(path.join(root, "registry/ikas")).map((f) => f.replace(/\.\w+$/, ""))
    : []
)
for (const name of ["badge", "button", "card"]) docsPages.add(name)
/** Items documented on a page with another path. */
const docsPaths = { sonner: "components/toast", status: "tokens" }
const docsUrl = (name) => (docsPaths[name] ? `${DOCS}/${docsPaths[name]}` : docsPages.has(name) ? `${DOCS}/components/${name}` : DOCS)

/**
 * Fixed category vocabulary. Every item gets one or two of these in `meta`;
 * the build fails on anything else so the docs index stays consistent.
 */
const CATEGORIES = /** @type {const} */ ([
  "theme", // design tokens
  "primitives", // restyled shadcn/ui building blocks
  "forms", // inputs, controls and form structure
  "layout", // page structure and containers
  "data-display", // tables, lists, metrics, badges
  "charts", // data visualization
  "feedback", // status, alerts, toasts, loading, empty states
  "overlays", // dialogs, sheets, popovers, menus, tooltips
  "navigation", // tabs, view switching, search, toolbars
  "motion", // animation helpers and animated components
  "utilities", // non-visual helpers
  "ai", // material for AI coding agents
])

/**
 * Title, description (at most 15 words, plain English) and 1–2 categories per item.
 * Required for every item: the build fails if one is missing.
 * @type {Record<string, { title?: string, description: string, categories: (typeof CATEGORIES)[number][] }>}
 */
const meta = {
  // Theme, helpers, rules
  theme: { title: "ikas Theme", description: "Light-first neutral theme tokens: surfaces, six-color palette, status colors, radius and elevation. Install first.", categories: ["theme"] },
  utils: { description: "The cn() helper that merges Tailwind class names; used by every component.", categories: ["utilities"] },
  motion: { description: "Shared spring and easing tokens so all animations in the app move the same way.", categories: ["motion", "utilities"] },
  status: { description: "Status tint classes: color variables per status for surfaces, text, icons and actions.", categories: ["utilities", "feedback"] },
  "ui-rules": { title: "UI Rules for AI agents", description: "ikas-ui.md design rules for AI coding agents; reference it from AGENTS.md or CLAUDE.md.", categories: ["ai"] },

  // Primitives (registry/ui)
  alert: { description: "Inline callout with icon, title, description and optional action, in default or destructive style.", categories: ["primitives", "feedback"] },
  avatar: { description: "Round user or store image with fallback initials, badge, and stacked groups.", categories: ["primitives", "data-display"] },
  badge: { description: "Small status or count label in status or palette colors, with optional dot.", categories: ["primitives", "data-display"] },
  button: { description: "Button in several variants and palette colors, with sizes, icons and asChild support.", categories: ["primitives", "forms"] },
  "button-group": { description: "Joins buttons, inputs or selects into one connected horizontal or vertical group.", categories: ["primitives", "forms"] },
  card: { description: "Raised surface with header, title, description, action, content and footer slots.", categories: ["primitives", "layout"] },
  chart: { description: "Recharts container, tooltip and legend wired to theme colors; base for the ikas charts.", categories: ["primitives", "charts"] },
  checkbox: { description: "Checkbox for on/off choices in forms and table row selection.", categories: ["primitives", "forms"] },
  dialog: { description: "Modal window for focused tasks and confirmations, with header, footer and close button.", categories: ["primitives", "overlays"] },
  "dropdown-menu": { description: "Menu of actions opened from a button, with groups, checkboxes, radios and submenus.", categories: ["primitives", "overlays"] },
  field: { description: "Form structure: label, description, error and grouping for any input control.", categories: ["primitives", "forms"] },
  input: { description: "Single-line text input styled with the theme's inset field surface.", categories: ["primitives", "forms"] },
  "input-group": { description: "Input or textarea with attached addons: icons, text, prefixes and buttons.", categories: ["primitives", "forms"] },
  kbd: { description: "Shows keyboard keys and shortcuts, alone or grouped.", categories: ["primitives", "data-display"] },
  label: { description: "Accessible text label for form controls.", categories: ["primitives", "forms"] },
  popover: { description: "Floating panel anchored to a trigger for small forms, pickers or extra details.", categories: ["primitives", "overlays"] },
  progress: { description: "Thin horizontal bar showing how far a task has progressed.", categories: ["primitives", "feedback"] },
  "radio-group": { description: "Set of radio buttons for picking exactly one option.", categories: ["primitives", "forms"] },
  select: { description: "Dropdown for picking one value from a list, with groups and separators.", categories: ["primitives", "forms"] },
  separator: { description: "Thin horizontal or vertical line that divides content.", categories: ["primitives", "layout"] },
  sheet: { description: "Panel that slides in from a screen edge for side tasks and details.", categories: ["primitives", "overlays"] },
  skeleton: { description: "Pulsing placeholder block shown while content loads.", categories: ["primitives", "feedback"] },
  sonner: { description: "Toast notifications in status colors, with soft variant, countdown bar and automatic dark theme.", categories: ["primitives", "feedback"] },
  spinner: { description: "Animated loading indicator for buttons and pending sections.", categories: ["primitives", "feedback"] },
  switch: { description: "Toggle switch for settings that turn on or off immediately.", categories: ["primitives", "forms"] },
  table: { description: "Basic table building blocks: header, body, rows, cells, footer and caption.", categories: ["primitives", "data-display"] },
  tabs: { description: "Tab list for switching between views of the same screen, in pill or line style.", categories: ["primitives", "navigation"] },
  textarea: { description: "Multi-line text input that grows with its content.", categories: ["primitives", "forms"] },
  tooltip: { description: "Short hint shown on hover or keyboard focus of an element.", categories: ["primitives", "overlays"] },

  // Patterns (registry/ikas)
  "action-bar": { description: "Icon toolbar whose labels appear on hover or focus; saves room in dense headers.", categories: ["navigation"] },
  "animated-check": { description: "Self-drawing check icon, plus a copy-to-clipboard button that confirms with it.", categories: ["motion", "forms"] },
  "animated-number": { description: "Number that rolls up or down when its value changes.", categories: ["motion", "data-display"] },
  "area-chart": { description: "Area or line chart over time, with stacking, legend, tooltip and estimated points.", categories: ["charts"] },
  banner: { title: "Banner", description: "Persistent message colored by status, with optional actions and dismiss.", categories: ["feedback"] },
  "bar-chart": { description: "Vertical or horizontal bar chart, grouped or stacked, with hover trace and in-progress bars.", categories: ["charts"] },
  "bar-list": { description: "Ranked list of labels with proportional bars and values, e.g. top products.", categories: ["charts", "data-display"] },
  "chart-card": { description: "Dashboard chart frame with title, headline value, change and a time range switch.", categories: ["charts", "layout"] },
  "chart-kit": { description: "Shared chart parts: colors, fills, legend, tooltip, loading and reveal used by ikas charts.", categories: ["charts", "utilities"] },
  collapse: { description: "Animates content open and closed between zero and full height.", categories: ["motion", "layout"] },
  "confirm-button": { description: "Two-click inline confirm for destructive actions that do not need a dialog.", categories: ["forms", "feedback"] },
  "description-list": { title: "Description List", description: "Key/value pairs for detail pages.", categories: ["data-display"] },
  "donut-chart": { description: "Donut chart for part-to-whole data, with the total in the center and a legend.", categories: ["charts"] },
  "empty-state": { title: "Empty State", description: "Explains an empty or failed view and offers the next step or a retry.", categories: ["feedback"] },
  "expandable-search": { description: "Search icon that expands into a text input and stays open while filled.", categories: ["forms", "navigation"] },
  launchpad: { title: "Launchpad", description: "First-run steps on a vertical rail; the active step opens in place with its actions.", categories: ["feedback", "layout"] },
  layout: { title: "Layout", description: "Column presets (main-aside, half, third) and numbered SettingsGroup sections for settings screens.", categories: ["layout"] },
  meter: { description: "Usage against a limit as a bar or ring, with warning and danger states.", categories: ["data-display", "feedback"] },
  "number-stepper": { description: "Number input with minus and plus buttons; click the value to type it.", categories: ["forms"] },
  page: { title: "Page", description: "Screen wrapper with width presets and a PageHeader with back link, badges and actions.", categories: ["layout"] },
  "record-table": { title: "Record Table", description: "Table for lists of records with selection, bulk actions, loading, empty, error and pagination.", categories: ["data-display"] },
  "unsaved-bar": { title: "Unsaved Bar", description: "Bar with save and discard that appears while a form has unsaved changes.", categories: ["forms", "feedback"] },
  "script-installer": { description: "Installs, updates and removes the app's storefront script, one row per storefront.", categories: ["forms"] },
  "segmented-control": { description: "Pick one of two to five options, as view tabs or a radio choice.", categories: ["forms", "navigation"] },
  "setting-row": { title: "Setting Row", description: "A single setting with its control aligned right.", categories: ["forms", "layout"] },
  sparkline: { description: "Tiny trend line without axes for stat cards and table cells.", categories: ["charts"] },
  "stat-card": { title: "Stat Card", description: "A metric with label, value and period-over-period change.", categories: ["data-display"] },
  "toggle-section": { description: "Feature section with an on/off switch that reveals its settings when on.", categories: ["forms", "layout"] },
}

const IGNORED_PACKAGES = new Set(["react", "react-dom", "next"])

function packageName(spec) {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/")
  return spec.split("/")[0]
}

function analyze(file) {
  const source = read(file)
  const dependencies = new Set()
  const registryDependencies = new Set()
  for (const [, spec] of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
    if (spec.startsWith("@/lib/")) registryDependencies.add(`${NAMESPACE}/${path.basename(spec)}`)
    else if (spec.startsWith("@/components/ui/") || spec.startsWith("@/components/ikas/") || spec.startsWith("@/hooks/"))
      registryDependencies.add(`${NAMESPACE}/${path.basename(spec)}`)
    else if (!spec.startsWith(".") && !spec.startsWith("@/")) {
      const pkg = packageName(spec)
      if (!IGNORED_PACKAGES.has(pkg)) dependencies.add(pkg)
    }
  }
  return { dependencies: [...dependencies].sort(), registryDependencies: [...registryDependencies].sort() }
}

function titleCase(name) {
  return name.replace(/(^|-)(\w)/g, (_, sep, c) => (sep ? " " : "") + c.toUpperCase())
}

function itemsFrom(dir, type, targetDir) {
  const abs = path.join(root, dir)
  if (!fs.existsSync(abs)) return []
  return fs
    .readdirSync(abs)
    .filter((f) => /\.(tsx?|jsx?)$/.test(f))
    .sort()
    .map((f) => {
      const name = f.replace(/\.\w+$/, "")
      const file = `${dir}/${f}`
      return {
        name,
        type,
        title: meta[name]?.title ?? titleCase(name),
        description: meta[name]?.description,
        categories: meta[name]?.categories,
        docs: docsUrl(name),
        ...analyze(file),
        files: [{ path: file, type, ...(targetDir ? { target: `${targetDir}/${f}` } : {}) }],
      }
    })
}

/** Parses `selector { --a: b; ... }` blocks out of globals.css. */
function cssBlock(css, selector) {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`Missing ${selector} block in registry/theme.css`)
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("\n}", start))
  const vars = {}
  for (const [, key, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[key] = value.trim()
  return vars
}

/**
 * Turns the CSS between the @registry:css markers into the nested object the
 * registry `css` field expects: `{ "@keyframes x": { from: { opacity: "0" } } }`.
 */
function cssToObject(css) {
  let i = 0
  function block() {
    const out = {}
    while (i < css.length) {
      const close = css.indexOf("}", i)
      const open = css.indexOf("{", i)
      const semi = css.indexOf(";", i)
      if (close !== -1 && (open === -1 || close < open) && (semi === -1 || close < semi)) {
        i = close + 1
        return out
      }
      if (open !== -1 && (semi === -1 || open < semi)) {
        const selector = css.slice(i, open).trim().replace(/\s+/g, " ")
        i = open + 1
        out[selector] = { ...(out[selector] ?? {}), ...block() }
      } else if (semi !== -1) {
        const decl = css.slice(i, semi).trim()
        i = semi + 1
        const colon = decl.indexOf(":")
        if (colon > 0) out[decl.slice(0, colon).trim()] = decl.slice(colon + 1).trim().replace(/\s+/g, " ")
      } else break
    }
    return out
  }
  return block()
}

function registryCss(css) {
  const start = css.indexOf("/* @registry:css:start */")
  const end = css.indexOf("/* @registry:css:end */")
  if (start === -1 || end === -1) return {}
  const body = css.slice(start + "/* @registry:css:start */".length, end).replace(/\/\*[\s\S]*?\*\//g, "")
  return cssToObject(body)
}

function themeItem() {
  const css = read("registry/theme.css")
  const theme = cssBlock(css, "@theme inline")
  for (const key of Object.keys(theme)) if (key.startsWith("font-")) delete theme[key]
  return {
    name: "theme",
    type: "registry:theme",
    title: meta.theme?.title,
    description: meta.theme?.description,
    categories: meta.theme?.categories,
    dependencies: ["shadcn", "tw-animate-css"],
    css: {
      '@import "tw-animate-css"': {},
      '@import "shadcn/tailwind.css"': {},
      ...registryCss(css),
    },
    cssVars: {
      theme,
      light: cssBlock(css, ":root"),
      dark: cssBlock(css, ".dark"),
    },
  }
}

const items = [
  themeItem(),
  ...itemsFrom("registry/lib", "registry:lib", "@lib"),
  ...itemsFrom("registry/ui", "registry:ui"),
  ...itemsFrom("registry/ikas", "registry:component", "@components/ikas"),
  ...itemsFrom("registry/hooks", "registry:hook", "@hooks"),
  {
    name: "ui-rules",
    type: "registry:file",
    title: meta["ui-rules"]?.title,
    description: meta["ui-rules"]?.description,
    categories: meta["ui-rules"]?.categories,
    files: [{ path: "registry/rules/ikas-ui.md", type: "registry:file", target: "~/ikas-ui.md" }],
  },
]

// Every item needs a short description and 1–2 categories from CATEGORIES.
const MAX_DESCRIPTION_WORDS = 15
const problems = []
for (const item of items) {
  const fix = `Add it to \`meta\` in scripts/build-registry.mjs.`
  if (!meta[item.name]) {
    problems.push(`"${item.name}" has no entry in \`meta\` (description and categories). ${fix}`)
    continue
  }
  const words = item.description?.trim().split(/\s+/).filter(Boolean).length ?? 0
  if (!words) problems.push(`"${item.name}" has no description. ${fix}`)
  else if (words > MAX_DESCRIPTION_WORDS)
    problems.push(`"${item.name}" description has ${words} words; keep it to ${MAX_DESCRIPTION_WORDS} in \`meta\`.`)
  const cats = item.categories
  if (!Array.isArray(cats) || cats.length < 1 || cats.length > 2)
    problems.push(`"${item.name}" needs 1–2 categories (got ${JSON.stringify(cats)}). ${fix}`)
  else
    for (const c of cats)
      if (!CATEGORIES.includes(c)) problems.push(`"${item.name}" uses unknown category "${c}". Use one of: ${CATEGORIES.join(", ")}.`)
}
for (const name of Object.keys(meta))
  if (!items.some((i) => i.name === name)) problems.push(`\`meta\` has an entry for "${name}", which is not a registry item. Remove it.`)
if (problems.length) {
  console.error(`build-registry: ${problems.length} problem(s):\n${problems.map((p) => `  - ${p}`).join("\n")}`)
  process.exit(1)
}

// Drop empty arrays/undefined to keep the output tidy.
for (const item of items) {
  for (const key of ["dependencies", "registryDependencies"]) if (item[key]?.length === 0) delete item[key]
  for (const key of ["title", "description", "categories"]) if (item[key] === undefined) delete item[key]
}

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "ikas",
  homepage: DOCS,
  items,
}

fs.writeFileSync(path.join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n")
console.log(`registry.json: ${items.length} items`)
