#!/usr/bin/env node
/**
 * Builds the brand asset pack in assets/brand from one parametric geometry.
 *
 * The mark is the ikas Builders symbol (bolt interlocked with a "B") on a
 * rounded tile. Two optical masters: `regular` for 32px and up, `small` with
 * wider cuts so the gaps survive at 16–24px.
 *
 *   node scripts/build-brand.mjs            # SVGs + PNGs + favicon.ico + social preview
 *   node scripts/build-brand.mjs --svg-only # no Chrome needed
 *
 * PNG rendering uses headless Chrome (CHROME_PATH to override). Outputs are
 * committed, so contributors only run this when the mark changes.
 */
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const out = path.join(root, "assets/brand")
const svgOnly = process.argv.includes("--svg-only")
const chrome =
  process.env.CHROME_PATH ??
  ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find((p) =>
    fs.existsSync(p)
  )

// --- Geometry ---------------------------------------------------------------
// Source space traced from the Builders logo; bbox x 0..570, y 50..447.
// The bolt is fixed. The two bowls keep a perpendicular gap `g` from it.

const SLOPE = 205 / 235 // run/rise of the bolt's diagonal
const SHIFT = 311.8 / 235 // horizontal offset per unit of perpendicular gap
const f = (n) => Number(n.toFixed(2))

function geometry(g) {
  const bolt = "M205 50V212H425L220 447V285H0Z"
  const topBottom = 212 - g
  const topDiagX = 480 - SLOPE * (topBottom - 158)
  const top = `M${f(205 + g)} 50H432A65 65 0 0 1 480 158L${f(topDiagX)} ${f(topBottom)}H${f(205 + g)}Z`
  const diagX = (y) => 425 - (y - 212) * SLOPE + SHIFT * g
  const bowl = `M${f(diagX(207))} 207H450A120 120 0 0 1 450 447H${f(diagX(447))}Z`
  return [bolt, top, bowl]
}

const masters = { regular: geometry(22), small: geometry(42) }

// Placement on a 32×32 tile: the mark spans 70% of the width, optically centered.
const TILE = 32
const RADIUS = 7.25
const MARK_W = 22.4
const s = MARK_W / 570
const tx = (TILE - MARK_W) / 2
const ty = (TILE - 397 * s) / 2 - 50 * s + 0.2
const transform = `translate(${f(tx)} ${f(ty)}) scale(${s.toFixed(5)})`

function tileSvg(paths, { tile, mark }) {
  const body = paths.map((d) => `<path d='${d}'/>`).join("")
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${TILE} ${TILE}' fill='none'>` +
    `<rect width='${TILE}' height='${TILE}' rx='${RADIUS}' fill='${tile}'/>` +
    `<g fill='${mark}' transform='${transform}'>${body}</g></svg>`
  )
}

function markSvg(paths, fill) {
  return (
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='-6 44 582 409' fill='none'>` +
    `<g fill='${fill}'>${paths.map((d) => `<path d='${d}'/>`).join("")}</g></svg>`
  )
}

// --- Files ------------------------------------------------------------------

fs.mkdirSync(path.join(out, "png"), { recursive: true })
const write = (name, content) => fs.writeFileSync(path.join(out, name), content + "\n")

const theme = { tile: "var(--foreground)", mark: "var(--background)" }
const black = { tile: "#0a0a0a", mark: "#ffffff" }
const white = { tile: "#ffffff", mark: "#0a0a0a" }

const svgs = {
  /** shadcn registry directory: themes itself through the site's CSS variables. */
  "logo.svg": tileSvg(masters.regular, theme),
  "logo-small.svg": tileSvg(masters.small, theme),
  "logo-black.svg": tileSvg(masters.regular, black),
  "logo-white.svg": tileSvg(masters.regular, white),
  "logo-black-small.svg": tileSvg(masters.small, black),
  "logo-white-small.svg": tileSvg(masters.small, white),
  /** Symbol without the tile, follows text color. */
  "mark.svg": markSvg(masters.regular, "currentColor"),
}
for (const [name, svg] of Object.entries(svgs)) write(name, svg)

// The exact value for the `logo` field of the shadcn directory entry.
write(
  "directory-entry.json",
  JSON.stringify(
    {
      name: "@ikas",
      homepage: "https://builders.ikas.com/docs/app-development/ui-kit",
      url: "https://builders.ikas.com/r/{name}.json",
      description: "UI components and screen patterns for building apps on ikas.",
      logo: svgs["logo.svg"],
    },
    null,
    2
  )
)

if (svgOnly) {
  console.log(`brand: ${Object.keys(svgs).length} SVGs (PNG rendering skipped)`)
  process.exit(0)
}
if (!chrome) {
  console.error("brand: Chrome not found. Set CHROME_PATH or run with --svg-only.")
  process.exit(1)
}

// --- PNG rendering ----------------------------------------------------------

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ikas-brand-"))

function render(html, width, height, file) {
  const page = path.join(tmp, `${path.basename(file)}.html`)
  fs.writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent}</style></head><body>${html}</body></html>`)
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--default-background-color=00000000",
    `--window-size=${width},${height}`,
    `--screenshot=${file}`,
    `file://${page}`,
  ], { stdio: "ignore" })
}

const sizes = [16, 24, 32, 48, 64, 128, 180, 192, 256, 512, 1024]
for (const size of sizes) {
  const paths = size <= 24 ? masters.small : masters.regular
  for (const [variant, colors] of Object.entries({ black, white })) {
    const svg = tileSvg(paths, colors).replace("<svg ", `<svg width='${size}' height='${size}' style='display:block' `)
    render(svg, size, size, path.join(out, "png", `logo-${variant}-${size}.png`))
  }
}

// favicon.ico with PNG-encoded 16/32/48 entries (supported by every current browser).
const icoSizes = [16, 32, 48]
const images = icoSizes.map((size) => fs.readFileSync(path.join(out, "png", `logo-black-${size}.png`)))
const header = Buffer.alloc(6 + 16 * images.length)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(images.length, 4)
let offset = header.length
images.forEach((img, i) => {
  const at = 6 + i * 16
  header.writeUInt8(icoSizes[i], at)
  header.writeUInt8(icoSizes[i], at + 1)
  header.writeUInt16LE(1, at + 4)
  header.writeUInt16LE(32, at + 6)
  header.writeUInt32LE(img.length, at + 8)
  header.writeUInt32LE(offset, at + 12)
  offset += img.length
})
fs.writeFileSync(path.join(out, "favicon.ico"), Buffer.concat([header, ...images]))

// GitHub social preview (Settings → Social preview), 1280×640.
const social = `
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@500&family=Geist:wght@400&display=block" rel="stylesheet">
<div style="width:1280px;height:640px;background:#0a0a0a;color:#fafafa;display:flex;flex-direction:column;justify-content:center;padding:0 120px;box-sizing:border-box;gap:44px">
  ${tileSvg(masters.regular, white).replace("<svg ", "<svg width='132' height='132' ")}
  <div style="display:flex;flex-direction:column;gap:18px">
    <div style="font:500 76px/1 'Geist Mono',ui-monospace,monospace;letter-spacing:-0.02em">ikas App UI</div>
    <div style="font:400 30px/1.4 Geist,system-ui,sans-serif;color:#a1a1aa;max-width:900px">UI components and screen patterns for building apps on ikas.</div>
  </div>
  <div style="font:500 24px/1 'Geist Mono',ui-monospace,monospace;color:#71717a">npx shadcn@latest add @ikas/page</div>
</div>`
render(social, 1280, 640, path.join(out, "social-preview.png"))

fs.rmSync(tmp, { recursive: true, force: true })
console.log(`brand: ${Object.keys(svgs).length} SVGs, ${sizes.length * 2} PNGs, favicon.ico, social-preview.png → assets/brand`)
