#!/usr/bin/env node
/**
 * Writes dist/thumbnails/: static screenshots of every example, demo and embed in
 * preview/out, plus index.json with their sizes. builders.ikas.com uses them for
 * visual index cards and to reserve each iframe's height before it loads.
 *
 *   examples/<slug>.webp   top of the screen at a 1280×800 viewport, scaled down
 *   demos/<id>.webp        the demo cropped to its content (plus padding)
 *   embeds/<name>.webp     the embed at its natural size
 *   <same>.dark.webp       the same capture in the kit's dark theme (`dark` class on
 *                          <html>, as ?theme=dark does), with the same clip and size
 *   index.json             { version, viewports, examples, demos, embeds }, each entry
 *                          { file, dark, width, height, naturalHeight, content? }. `dark`
 *                          is the dark variant's file (absent with --light-only).
 *                          naturalHeight is the height the preview reports to its iframe
 *                          (ikas-ui:height) at the viewport width in `viewports`.
 *                          Demos also get `content` { x, y, width, height }: the painted
 *                          part of the image (text, controls, surfaces; not layout
 *                          wrappers) plus 16px, when it is smaller than the image, so
 *                          index cards can center what is visible.
 *
 *   node scripts/build-thumbnails.mjs            # skips (exit 0) when Chrome is missing
 *   node scripts/build-thumbnails.mjs --strict   # fails when Chrome is missing
 *   node scripts/build-thumbnails.mjs --only=orders,page/simple
 *   node scripts/build-thumbnails.mjs --light-only   # skip the dark variants
 *   THUMBNAILS_CONCURRENCY=1 node scripts/build-thumbnails.mjs   # tabs in parallel (default 2)
 *
 * Needs `pnpm preview:build` first. Serves preview/out under /ui-preview on a free
 * local port and drives headless Chrome (CHROME_PATH to override) over the DevTools
 * protocol with Node's global WebSocket, so it has no dependencies. Each page is
 * captured in the light theme, then switched to dark in place and captured again.
 * Reduced motion and zero-length CSS animations keep the output deterministic.
 */
import { spawn } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const previewOut = path.join(root, "preview/out")
const manifestDir = path.join(root, "dist/manifest")
const out = path.join(root, "dist/thumbnails")
const BASE = "/ui-preview"

const args = process.argv.slice(2)
const strict = args.includes("--strict")
const withDark = !args.includes("--light-only")
const only = args.find((a) => a.startsWith("--only="))?.slice("--only=".length).split(",").filter(Boolean)
/** Tabs captured in parallel in the one Chrome. Low by default: each tab holds a full page in memory. */
const CONCURRENCY = Math.max(1, Number(process.env.THUMBNAILS_CONCURRENCY ?? process.env.THUMBS_CONCURRENCY ?? 2) || 2)

/** Viewports. DEMO_WIDTH is the docs content column (builders.ikas.com at 1440px wide). */
const EXAMPLE = { width: 1280, height: 800, scale: 0.625 } // -> 800×500 image
const DEMO_WIDTH = 800
const EMBED_WIDTH = 800
const DEMO_PAD = 24 // px kept around the demo content when cropping
const PAINT_PAD = 16 // px kept around the painted content in `content` (index cards)
const QUALITY = { example: 78, demo: 82, embed: 80 }
const SETTLE_MS = 600 // after load + fonts, for charts and entrance animations driven by JS

const chrome =
  process.env.CHROME_PATH ??
  [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].find((p) => fs.existsSync(p))

if (!chrome || !fs.existsSync(chrome)) {
  const msg = "thumbnails: Chrome not found, skipping dist/thumbnails. Set CHROME_PATH to build them."
  if (strict) {
    console.error(msg)
    process.exit(1)
  }
  console.warn(msg)
  process.exit(0)
}
if (!fs.existsSync(path.join(previewOut, "index.html"))) {
  console.error("thumbnails: preview/out missing, run `pnpm preview:build` first.")
  process.exit(1)
}
if (typeof WebSocket !== "function") {
  console.error("thumbnails: needs a Node version with a global WebSocket (22+).")
  process.exit(1)
}

// --- jobs ----------------------------------------------------------------------

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"))
const htmlExists = (route) => fs.existsSync(path.join(previewOut, `${route}.html`))
const listHtml = (dir) =>
  fs.existsSync(path.join(previewOut, dir))
    ? fs.readdirSync(path.join(previewOut, dir), { recursive: true })
        .map((f) => f.split(path.sep).join("/"))
        .filter((f) => f.endsWith(".html"))
        .map((f) => f.slice(0, -".html".length))
    : []

const exampleSlugs = fs.existsSync(path.join(manifestDir, "examples.json"))
  ? Object.keys(readJson(path.join(manifestDir, "examples.json")))
  : []
const demoIds = fs.existsSync(path.join(manifestDir, "demos.json"))
  ? Object.keys(readJson(path.join(manifestDir, "demos.json")))
  : listHtml("demo")
const embedNames = listHtml("embed")

const jobs = [
  ...exampleSlugs.map((id) => ({ kind: "examples", id, route: id })),
  ...demoIds.map((id) => ({ kind: "demos", id, route: `demo/${id}` })),
  ...embedNames.map((id) => ({ kind: "embeds", id, route: `embed/${id}` })),
]
  .filter((job) => !only || only.includes(job.id))
  .filter((job) => {
    if (htmlExists(job.route)) return true
    console.warn(`warn: preview/out/${job.route}.html missing, skipped`)
    return false
  })

// --- static server -------------------------------------------------------------

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".webp": "image/webp",
}

function resolveFile(urlPath) {
  if (urlPath !== BASE && !urlPath.startsWith(`${BASE}/`)) return null
  const rel = decodeURIComponent(urlPath.slice(BASE.length)).replace(/^\/+/, "") || "index"
  const file = path.join(previewOut, rel)
  if (!file.startsWith(previewOut)) return null
  for (const candidate of [file, `${file}.html`, path.join(file, "index.html")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
  }
  return null
}

const server = http.createServer((req, res) => {
  const file = resolveFile(new URL(req.url, "http://localhost").pathname)
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain" }).end("not found")
    return
  }
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" })
  fs.createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const origin = `http://127.0.0.1:${server.address().port}`

// --- Chrome over CDP -------------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "ikas-thumbs-"))
const browser = spawn(
  chrome,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-gpu",
    "--hide-scrollbars",
    "--mute-audio",
    "--force-color-profile=srgb",
    "--font-render-hinting=none",
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] }
)

async function cleanup() {
  server.close()
  if (browser.exitCode === null) {
    const exited = new Promise((resolve) => browser.once("exit", resolve))
    browser.kill()
    await Promise.race([exited, sleep(5000)])
  }
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}

const wsUrl = await new Promise((resolve, reject) => {
  let buffer = ""
  const timer = setTimeout(() => reject(new Error("Chrome did not start within 20s")), 20_000)
  browser.stderr.on("data", (chunk) => {
    buffer += chunk
    const m = buffer.match(/DevTools listening on (ws:\/\/\S+)/)
    if (m) {
      clearTimeout(timer)
      resolve(m[1])
    }
  })
  browser.on("exit", (code) => reject(new Error(`Chrome exited (${code}) before DevTools was ready`)))
})

const socket = new WebSocket(wsUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true })
  socket.addEventListener("error", reject, { once: true })
})

let nextId = 0
const pending = new Map()
const listeners = new Set()
socket.addEventListener("message", ({ data }) => {
  const msg = JSON.parse(data)
  if (msg.id !== undefined) {
    const p = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) p?.reject(new Error(`${p.method}: ${msg.error.message}`))
    else p?.resolve(msg.result)
  } else {
    for (const listener of listeners) listener(msg)
  }
})

function send(method, params = {}, sessionId) {
  const id = ++nextId
  socket.send(JSON.stringify({ id, method, params, sessionId }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject, method }))
}

function waitForEvent(sessionId, method, timeout = 30_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      listeners.delete(listener)
      reject(new Error(`timed out waiting for ${method}`))
    }, timeout)
    const listener = (msg) => {
      if (msg.sessionId !== sessionId || msg.method !== method) return
      clearTimeout(timer)
      listeners.delete(listener)
      resolve(msg.params)
    }
    listeners.add(listener)
  })
}

/** Zero-length CSS motion and no caret, injected before any page script runs. */
const FREEZE_MOTION = `
(() => {
  const css = "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important;caret-color:transparent!important;scroll-behavior:auto!important}";
  const add = () => {
    const style = document.createElement("style");
    style.setAttribute("data-thumbnails", "");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.documentElement) add(); else document.addEventListener("DOMContentLoaded", add, { once: true });
})();`

async function evaluate(sessionId, expression) {
  const { result, exceptionDetails } = await send(
    "Runtime.evaluate",
    { expression, awaitPromise: true, returnByValue: true },
    sessionId
  )
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text)
  return result.value
}

/** Waits for fonts, two frames and a settle delay, then finishes any finite Web Animations. */
const SETTLE = `
(async () => {
  await document.fonts.ready;
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, ${SETTLE_MS}));
  for (const a of document.getAnimations()) {
    try { if (a.effect?.getComputedTiming().endTime !== Infinity) a.finish(); } catch {}
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return document.fonts.status;
})()`

/** After switching the theme in place: two frames, a short settle, finish any animations. */
const SETTLE_THEME = `
(async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 150));
  for (const a of document.getAnimations()) {
    try { if (a.effect?.getComputedTiming().endTime !== Infinity) a.finish(); } catch {}
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
})()`

const MEASURE = {
  examples: `({ natural: Math.ceil(document.documentElement.scrollHeight) })`,
  // The demo root is what FrameHeightReporter observes. The crop is the union of
  // its descendants' boxes (centered content can be much smaller than the root).
  demos: `(() => {
    const root = document.querySelector("[data-demo-root]");
    const rootBox = root.getBoundingClientRect();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const el of root.querySelectorAll("*")) {
      if (el.closest("[hidden]")) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "contents") continue;
      const b = el.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) continue;
      x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom);
    }
    if (x0 === Infinity) { x0 = rootBox.left; y0 = rootBox.top; x1 = rootBox.right; y1 = rootBox.bottom; }

    // What is actually painted: text, media, form controls and boxes with a fill,
    // border or shadow, each clipped by its overflow ancestors. Layout wrappers
    // (a full-width row that right-aligns two buttons) do not count, so index
    // cards can center the visible part of the demo.
    const clear = (c) => {
      if (!c || c === "transparent") return true;
      const alpha = c.includes("/") ? c.slice(c.lastIndexOf("/") + 1) : c.startsWith("rgba(") ? c.slice(c.lastIndexOf(",") + 1) : "1";
      return parseFloat(alpha) === 0;
    };
    const MEDIA = new Set(["IMG", "svg", "CANVAS", "VIDEO", "INPUT", "TEXTAREA", "SELECT", "PROGRESS", "METER"]);
    const clipped = (el, b) => {
      let { left, top, right, bottom } = b;
      for (let p = el.parentElement; p && p !== root.parentElement; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.overflowX === "visible" && s.overflowY === "visible") continue;
        const r = p.getBoundingClientRect();
        if (s.overflowX !== "visible") { left = Math.max(left, r.left); right = Math.min(right, r.right); }
        if (s.overflowY !== "visible") { top = Math.max(top, r.top); bottom = Math.min(bottom, r.bottom); }
      }
      return { left, top, right, bottom };
    };
    let px0 = Infinity, py0 = Infinity, px1 = -Infinity, py1 = -Infinity;
    const addBox = (el, b) => {
      const c = clipped(el, b);
      if (c.right - c.left < 1 || c.bottom - c.top < 1) return;
      px0 = Math.min(px0, c.left); py0 = Math.min(py0, c.top); px1 = Math.max(px1, c.right); py1 = Math.max(py1, c.bottom);
    };
    const invisible = (el) => {
      for (let p = el; p && p !== root; p = p.parentElement) {
        if (p.hidden) return true;
        const s = getComputedStyle(p);
        if (s.opacity === "0" || s.visibility === "hidden") return true;
      }
      return false;
    };
    for (const el of root.querySelectorAll("*")) {
      if (el instanceof SVGElement && el.ownerSVGElement) continue;
      const style = getComputedStyle(el);
      if (style.display === "contents" || invisible(el)) continue;
      const painted =
        MEDIA.has(el.tagName) ||
        !clear(style.backgroundColor) ||
        style.backgroundImage !== "none" ||
        style.boxShadow !== "none" ||
        ["Top", "Right", "Bottom", "Left"].some((side) => parseFloat(style["border" + side + "Width"]) > 0 && !clear(style["border" + side + "Color"]));
      if (painted) addBox(el, el.getBoundingClientRect());
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim() || !node.parentElement || invisible(node.parentElement)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      addBox(node.parentElement, range.getBoundingClientRect());
    }
    const painted = px0 === Infinity ? null : { x: px0, y: py0, width: px1 - px0, height: py1 - py0 };

    return { natural: Math.ceil(rootBox.height), root: { x: rootBox.left, y: rootBox.top, width: rootBox.width, height: rootBox.height }, content: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, painted };
  })()`,
  // Embed pages wrap the block and FrameHeightReporter in a padded div.
  embeds: `(() => {
    const root = [...document.querySelectorAll("body span[hidden]")].map((s) => s.parentElement).find((el) => el && el.getBoundingClientRect().height > 0);
    const b = (root ?? document.body).getBoundingClientRect();
    return { natural: Math.ceil(b.height) };
  })()`,
}

/** Writes a base64 WebP from Page.captureScreenshot to dist/thumbnails/<file>; returns its size. */
function save(file, data) {
  const buffer = Buffer.from(data, "base64")
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("Chrome did not return a WebP image")
  }
  fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true })
  fs.writeFileSync(path.join(out, file), buffer)
  return buffer.length
}

async function capture(job) {
  const { targetId } = await send("Target.createTarget", { url: "about:blank" })
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true })
  try {
    await send("Page.enable", {}, sessionId)
    await send("Runtime.enable", {}, sessionId)
    await send("Page.addScriptToEvaluateOnNewDocument", { source: FREEZE_MOTION }, sessionId)
    await send(
      "Emulation.setEmulatedMedia",
      {
        media: "screen",
        features: [
          { name: "prefers-color-scheme", value: "light" },
          { name: "prefers-reduced-motion", value: "reduce" },
        ],
      },
      sessionId
    )
    const width = job.kind === "examples" ? EXAMPLE.width : job.kind === "demos" ? DEMO_WIDTH : EMBED_WIDTH
    const viewportHeight = job.kind === "examples" ? EXAMPLE.height : 800
    const metrics = (height) =>
      send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false }, sessionId)
    await metrics(viewportHeight)

    const query = job.kind === "demos" ? "?align=center" : ""
    const loaded = waitForEvent(sessionId, "Page.loadEventFired")
    await send("Page.navigate", { url: `${origin}${BASE}/${job.route}${query}` }, sessionId)
    await loaded
    const fonts = await evaluate(sessionId, SETTLE)
    if (fonts !== "loaded") console.warn(`warn: ${job.kind}/${job.id}: fonts ${fonts}`)

    const m = await evaluate(sessionId, MEASURE[job.kind])
    let clip
    let scale = 1
    let paintedBox
    if (job.kind === "examples") {
      clip = { x: 0, y: 0, width: EXAMPLE.width, height: EXAMPLE.height }
      scale = EXAMPLE.scale
    } else {
      // Grow the viewport to the full content so nothing is clipped, then re-measure.
      await metrics(Math.max(viewportHeight, m.natural))
      await evaluate(sessionId, `new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))`)
      const final = await evaluate(sessionId, MEASURE[job.kind])
      Object.assign(m, final)
      if (job.kind === "demos") {
        const { root, content } = m
        const x = Math.max(root.x, Math.floor(content.x - DEMO_PAD))
        const y = Math.max(root.y, Math.floor(content.y - DEMO_PAD))
        const right = Math.min(root.x + root.width, Math.ceil(content.x + content.width + DEMO_PAD))
        const bottom = Math.min(root.y + root.height, Math.ceil(content.y + content.height + DEMO_PAD))
        clip = { x, y, width: right - x, height: bottom - y }
        // The painted part of the demo inside the image (PAINT_PAD around it), for
        // index cards; only recorded when it is noticeably smaller than the image.
        if (m.painted) {
          const px = Math.max(clip.x, Math.floor(m.painted.x - PAINT_PAD))
          const py = Math.max(clip.y, Math.floor(m.painted.y - PAINT_PAD))
          const pr = Math.min(clip.x + clip.width, Math.ceil(m.painted.x + m.painted.width + PAINT_PAD))
          const pb = Math.min(clip.y + clip.height, Math.ceil(m.painted.y + m.painted.height + PAINT_PAD))
          const box = { x: px - clip.x, y: py - clip.y, width: pr - px, height: pb - py }
          if (box.width > 0 && box.height > 0 && (clip.width - box.width > 8 || clip.height - box.height > 8)) paintedBox = box
        }
      } else {
        clip = { x: 0, y: 0, width, height: m.natural }
      }
    }

    const screenshotParams = {
      format: "webp",
      quality: QUALITY[job.kind.slice(0, -1)],
      clip: { ...clip, scale },
      captureBeyondViewport: false,
      optimizeForSpeed: false,
    }
    const { data } = await send("Page.captureScreenshot", screenshotParams, sessionId)
    const file = `${job.kind}/${job.id}.webp`
    const bytes = { light: save(file, data), dark: 0 }

    // Dark variant: the same page and clip with the kit's `.dark` tokens, like
    // ?theme=dark or an `ikas-ui:theme` message would set.
    let dark
    if (withDark) {
      await send(
        "Emulation.setEmulatedMedia",
        {
          media: "screen",
          features: [
            { name: "prefers-color-scheme", value: "dark" },
            { name: "prefers-reduced-motion", value: "reduce" },
          ],
        },
        sessionId
      )
      await evaluate(sessionId, `document.documentElement.classList.add("dark")`)
      await evaluate(sessionId, SETTLE_THEME)
      const shot = await send("Page.captureScreenshot", screenshotParams, sessionId)
      dark = `${job.kind}/${job.id}.dark.webp`
      bytes.dark = save(dark, shot.data)
    }

    return {
      file,
      ...(dark ? { dark } : {}),
      width: Math.round(clip.width * scale),
      height: Math.round(clip.height * scale),
      naturalHeight: m.natural,
      ...(paintedBox ? { content: paintedBox } : {}),
      bytes,
    }
  } finally {
    await send("Target.closeTarget", { targetId }).catch(() => {})
  }
}

// --- run -------------------------------------------------------------------------

const index = {
  version: readJson(path.join(root, "package.json")).version,
  viewports: {
    examples: { width: EXAMPLE.width, height: EXAMPLE.height, scale: EXAMPLE.scale },
    demos: { width: DEMO_WIDTH },
    embeds: { width: EMBED_WIDTH },
  },
  examples: {},
  demos: {},
  embeds: {},
}

let failed = 0
try {
  if (!only) fs.rmSync(out, { recursive: true, force: true })
  else if (fs.existsSync(path.join(out, "index.json"))) Object.assign(index, readJson(path.join(out, "index.json")), { version: index.version })
  fs.mkdirSync(out, { recursive: true })

  const queue = [...jobs]
  const results = []
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (let job = queue.shift(); job; job = queue.shift()) {
        try {
          results.push([job, await capture(job)])
        } catch (error) {
          failed++
          console.error(`error: ${job.kind}/${job.id}: ${error.message}`)
        }
      }
    })
  )

  // Stable key order regardless of which tab finished first.
  results.sort(([a], [b]) => (a.kind + a.id).localeCompare(b.kind + b.id))
  const totals = { examples: [0, 0, 0], demos: [0, 0, 0], embeds: [0, 0, 0] }
  for (const [job, { bytes, ...entry }] of results) {
    index[job.kind][job.id] = entry
    totals[job.kind][0]++
    totals[job.kind][1] += bytes.light
    totals[job.kind][2] += bytes.dark
  }
  for (const kind of ["examples", "demos", "embeds"]) {
    index[kind] = Object.fromEntries(Object.entries(index[kind]).sort(([a], [b]) => a.localeCompare(b)))
  }
  fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(index, null, 2) + "\n")
  const kb = (n) => `${Math.round(n / 1024)} KB`
  for (const [kind, [count, light, dark]] of Object.entries(totals)) {
    if (!count) continue
    const darkPart = dark ? `, dark ${kb(dark)} (avg ${kb(dark / count)})` : ""
    console.log(`dist/thumbnails/${kind}: ${count} captures, light ${kb(light)} (avg ${kb(light / count)})${darkPart}`)
  }
  const all = Object.values(totals).reduce((sum, [, light, dark]) => sum + light + dark, 0)
  console.log(`dist/thumbnails: ${kb(all)} total${withDark ? " (light + dark)" : ""}`)
} finally {
  socket.close()
  await cleanup()
}

if (failed) {
  console.error(`thumbnails: ${failed} failed`)
  process.exit(1)
}
