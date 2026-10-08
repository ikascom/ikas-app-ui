#!/usr/bin/env node
/**
 * Mirrors shadcn's Registry Health checks locally, so a failing item shows up
 * here before the weekly check flags it on the public index.
 *
 *   pnpm registry:build && pnpm health
 *
 *   SHADCN_VERSION=4.21.3   shadcn CLI version to use (default: latest)
 *   HEALTH_CONCURRENCY=4    items checked in parallel (default: 4)
 *   --keep                  keep the temp project for inspection
 *
 * 1. Hygiene / correctness of dist/r:
 *    - every dist/r/<name>.json has `name === <name>`,
 *    - dist/r/registry.json is named "ikas", has unique item names and no
 *      inlined files[].content,
 *    - every item in registry.json has its dist/r/<name>.json.
 * 2. Installability: in a bare temp project (package.json, a tsconfig.json with
 *    the `@/*` path the CLI needs, components.json with style radix-vega, an EMPTY app/globals.css, the default aliases and
 *    `@ikas` pointing at a local server for dist/r), runs
 *    `shadcn add @ikas/<item> --dry-run --yes` for every item with a 60s
 *    timeout each, like the health check does.
 *
 * Exits 1 on any failure.
 */
import { spawn } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const distR = path.join(root, "dist/r")
const keep = process.argv.includes("--keep")
const shadcn = `shadcn@${process.env.SHADCN_VERSION || "latest"}`
const concurrency = Math.max(1, Number(process.env.HEALTH_CONCURRENCY) || 4)
const TIMEOUT_MS = 60_000
const NAMESPACE = "@ikas"

if (!fs.existsSync(path.join(distR, "registry.json"))) {
  console.error("dist/r is missing. Run `pnpm registry:build` first.")
  process.exit(1)
}

// --- 1. Hygiene / correctness ------------------------------------------------

const problems = []
const index = JSON.parse(fs.readFileSync(path.join(distR, "registry.json"), "utf8"))
if (index.name !== "ikas") problems.push(`dist/r/registry.json: name is ${JSON.stringify(index.name)}, expected "ikas"`)
const names = (index.items ?? []).map((i) => i.name)
const dupes = names.filter((n, i) => names.indexOf(n) !== i)
if (dupes.length) problems.push(`dist/r/registry.json: duplicate item names: ${[...new Set(dupes)].join(", ")}`)
for (const item of index.items ?? [])
  if ((item.files ?? []).some((f) => "content" in f))
    problems.push(`dist/r/registry.json: item "${item.name}" inlines files[].content (keep content in dist/r/${item.name}.json only)`)

for (const file of fs.readdirSync(distR).filter((f) => f.endsWith(".json") && f !== "registry.json")) {
  const expected = file.replace(/\.json$/, "")
  const { name } = JSON.parse(fs.readFileSync(path.join(distR, file), "utf8"))
  if (name !== expected) problems.push(`dist/r/${file}: name is ${JSON.stringify(name)}, expected "${expected}"`)
}
for (const name of names) if (!fs.existsSync(path.join(distR, `${name}.json`))) problems.push(`dist/r/${name}.json is missing`)

if (problems.length) {
  console.error(`✗ Hygiene: ${problems.length} problem(s)\n${problems.map((p) => `  - ${p}`).join("\n")}`)
} else console.log(`✓ Hygiene: ${names.length} items, names match file names, no inlined content in registry.json`)

// --- 2. Installability -------------------------------------------------------

function serve(dir) {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname)
    const file = path.join(dir, path.normalize(url.replace(/^\/r\//, "/")))
    if (!file.startsWith(dir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end("not found")
      return
    }
    res.writeHead(200, { "content-type": "application/json" }).end(fs.readFileSync(file))
  })
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)))
}

/** Runs a command without blocking the event loop (the registry server lives in this process). */
function run(cmd, args, { timeout, ...opts } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"], ...opts })
    let output = ""
    let timedOut = false
    child.stdout.on("data", (d) => (output += d))
    child.stderr.on("data", (d) => (output += d))
    const timer = timeout
      ? setTimeout(() => {
          timedOut = true
          child.kill("SIGKILL")
        }, timeout)
      : undefined
    child.on("error", (error) => {
      clearTimeout(timer)
      resolve({ status: 1, output: String(error), timedOut })
    })
    child.on("close", (status) => {
      clearTimeout(timer)
      resolve({ status, output, timedOut })
    })
  })
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ikas-app-ui-health-"))
const server = await serve(distR)
const registryUrl = `http://127.0.0.1:${server.address().port}/r/{name}.json`
const results = []

try {
  fs.writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "health-check", version: "0.0.0", private: true }, null, 2))
  // The shadcn CLI resolves aliases through tsconfig paths and refuses to run without one.
  fs.writeFileSync(
    path.join(tmp, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["./*"] } } }, null, 2)
  )
  fs.mkdirSync(path.join(tmp, "app"))
  fs.writeFileSync(path.join(tmp, "app/globals.css"), "")
  fs.writeFileSync(
    path.join(tmp, "components.json"),
    JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "radix-vega",
        rsc: true,
        tsx: true,
        tailwind: { config: "", css: "app/globals.css", baseColor: "neutral", cssVariables: true, prefix: "" },
        iconLibrary: "lucide",
        aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" },
        registries: { [NAMESPACE]: registryUrl },
      },
      null,
      2
    )
  )

  const env = { ...process.env, CI: "true" }
  console.log(`\n▸ Bare project: ${tmp}\n▸ ${NAMESPACE} -> ${registryUrl}`)
  // Fetch the CLI once so per-item timeouts measure the add, not the npx download.
  const warm = await run("npx", ["-y", shadcn, "--version"], { cwd: tmp, env })
  if (warm.status !== 0) throw new Error(`could not run ${shadcn}:\n${warm.output}`)
  console.log(`▸ ${shadcn} (${warm.output.trim()}), ${names.length} items, ${concurrency} at a time, ${TIMEOUT_MS / 1000}s timeout each\n`)

  const queue = [...names]
  async function worker() {
    for (let name; (name = queue.shift()); ) {
      const started = Date.now()
      const res = await run("npx", ["-y", shadcn, "add", `${NAMESPACE}/${name}`, "--dry-run", "--yes"], { cwd: tmp, env, timeout: TIMEOUT_MS })
      const ok = res.status === 0 && !res.timedOut
      const seconds = ((Date.now() - started) / 1000).toFixed(1)
      results.push({ name, ok, seconds, output: res.output, timedOut: res.timedOut })
      console.log(`${ok ? "✓" : "✗"} ${NAMESPACE}/${name} (${seconds}s)${res.timedOut ? " timed out" : ""}`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker))
} catch (error) {
  console.error(`✗ ${error.message}`)
  results.push({ name: "(setup)", ok: false, output: "" })
} finally {
  server.close()
  if (keep) console.log(`\nKept ${tmp}`)
  else fs.rmSync(tmp, { recursive: true, force: true })
}

const failed = results.filter((r) => !r.ok)
for (const r of failed) {
  const tail = r.output.trim().split("\n").slice(-15).join("\n")
  console.error(`\n--- ${NAMESPACE}/${r.name} ${r.timedOut ? "(timed out)" : ""}\n${tail}`)
}
const ok = !problems.length && !failed.length
console.log(
  `\n${ok ? "✓" : "✗"} health check ${ok ? "passed" : "failed"}: ` +
    `${results.length - failed.length}/${results.length} items installable, ${problems.length} hygiene problem(s)`
)
process.exit(ok ? 0 : 1)
