#!/usr/bin/env node
/**
 * Install smoke test: installs every @ikas item into a fresh copy of the ikas
 * starter app with the real shadcn CLI, then type-checks the result.
 *
 *   pnpm registry:build && pnpm smoke [--keep] [--next-build]
 *
 *   IKAS_STARTER_DIR=/path/to/starter-app   use a local starter instead of cloning
 *                                           ikascom/ikas-app-examples (it is copied, never modified)
 *   SHADCN_VERSION=4.21.3                   shadcn CLI version to use (default: latest)
 *   --keep                                  keep the temp app for inspection
 *   --next-build                            also run `next build` in the app
 *
 * Fails if an item's file is missing after install, or on type errors in files
 * the shadcn CLI wrote or in the app's components/ and hooks/ (which import
 * them). Type errors elsewhere in the starter app are reported but ignored.
 */
import { spawn } from "node:child_process"
import crypto from "node:crypto"
import fs from "node:fs"
import http from "node:http"
import os from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const args = new Set(process.argv.slice(2))
const keep = args.has("--keep")
const nextBuild = args.has("--next-build")
const shadcn = `shadcn@${process.env.SHADCN_VERSION || "latest"}`
const STARTER_REPO = "https://github.com/ikascom/ikas-app-examples"
const IGNORED = new Set(["node_modules", ".next", ".git", ".env", ".env.local"])

const log = (msg) => console.log(`\n▸ ${msg}`)
/** Runs a command asynchronously (the registry server lives in this process, so nothing may block the event loop). */
function run(cmd, cmdArgs, { input, allowFail, capture, ...opts } = {}) {
  console.log(`$ ${cmd} ${cmdArgs.join(" ")}`)
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { stdio: [input ? "pipe" : "ignore", capture ? "pipe" : "inherit", capture ? "pipe" : "inherit"], ...opts })
    let output = ""
    child.stdout?.on("data", (d) => (output += d))
    child.stderr?.on("data", (d) => (output += d))
    if (input) {
      child.stdin.on("error", () => {})
      child.stdin.end(input)
    }
    child.on("error", reject)
    child.on("close", (status) => {
      if (status !== 0 && !allowFail) reject(new Error(`${cmd} ${cmdArgs.join(" ")} exited with ${status}`))
      else resolve({ status, output })
    })
  })
}

/** path -> sha1 of every file in the app, to tell which files the shadcn CLI touched. */
function snapshot(dir, base = dir, acc = new Map()) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) snapshot(abs, base, acc)
    else if (entry.isFile()) acc.set(path.relative(base, abs), crypto.createHash("sha1").update(fs.readFileSync(abs)).digest("hex"))
  }
  return acc
}

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

const distR = path.join(root, "dist/r")
if (!fs.existsSync(path.join(distR, "theme.json"))) {
  console.error("dist/r is missing. Run `pnpm registry:build` first.")
  process.exit(1)
}
const items = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8")).items
const names = items.map((i) => i.name)
const expectedFiles = items.flatMap((i) => (i.files ?? []).map((f) => path.basename(f.target ?? f.path)))

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ikas-app-ui-smoke-"))
const app = path.join(tmp, "app")
const server = await serve(distR)
const port = server.address().port
let failed = false

try {
  log("Preparing starter app")
  let starter = process.env.IKAS_STARTER_DIR
  if (!starter) {
    await run("git", ["clone", "--depth", "1", STARTER_REPO, path.join(tmp, "examples")])
    starter = path.join(tmp, "examples/examples/starter-app")
  }
  fs.cpSync(path.resolve(starter), app, { recursive: true, filter: (src) => !IGNORED.has(path.basename(src)) })
  console.log(`app: ${app}`)

  const env = { ...process.env, CI: "true", COREPACK_ENABLE_STRICT: "0" }
  log("Installing starter dependencies")
  await run("pnpm", ["install", "--no-frozen-lockfile"], { cwd: app, env })
  // Generates the Prisma client so the starter type-checks cleanly. Optional.
  await run("pnpm", ["exec", "prisma", "generate"], { cwd: app, env, allowFail: true })

  const before = snapshot(app)
  const registryUrl = `http://localhost:${port}/r/{name}.json`
  log(`Adding @ikas registry (${registryUrl})`)
  await run("npx", ["-y", shadcn, "registry", "add", `@ikas=${registryUrl}`], { cwd: app, env })

  const yes = "y\n".repeat(200)
  log("Installing @ikas/theme")
  await run("npx", ["-y", shadcn, "add", "@ikas/theme", "--overwrite", "--yes"], { cwd: app, env, input: yes })
  const rest = names.filter((n) => n !== "theme").map((n) => `@ikas/${n}`)
  log(`Installing ${rest.length} items`)
  await run("npx", ["-y", shadcn, "add", ...rest, "--overwrite", "--yes"], { cwd: app, env, input: yes })

  const after = snapshot(app)
  const touched = new Set([...after].filter(([file, hash]) => before.get(file) !== hash).map(([file]) => file))
  const present = new Set([...after.keys()].map((f) => path.basename(f)))
  const missing = expectedFiles.filter((f) => !present.has(f))
  console.log(`shadcn wrote ${touched.size} files`)
  if (missing.length) {
    console.error(`✗ Missing after install: ${missing.join(", ")}`)
    failed = true
  }

  const cssPath = JSON.parse(fs.readFileSync(path.join(app, "components.json"), "utf8")).tailwind.css
  const css = fs.readFileSync(path.join(app, cssPath), "utf8")
  const tokens = Object.keys(JSON.parse(fs.readFileSync(path.join(distR, "theme.json"), "utf8")).cssVars.light)
  const missingTokens = tokens.filter((t) => !css.includes(`--${t}:`))
  if (missingTokens.length) {
    console.error(`✗ ${cssPath} is missing theme tokens: ${missingTokens.join(", ")}`)
    failed = true
  } else console.log(`✓ ${tokens.length} theme tokens in ${cssPath}`)

  log("Type-checking")
  const tsc = await run("pnpm", ["exec", "tsc", "--noEmit", "--pretty", "false"], { cwd: app, env, capture: true, allowFail: true })
  const errors = tsc.output.split("\n").filter((l) => /\(\d+,\d+\): error TS/.test(l))
  // Installed files, plus starter components that import them (e.g. a page using <Button>).
  const isOurs = (file) => touched.has(file) || /^(src\/)?(components|hooks)\//.test(file)
  const ours = errors.filter((l) => isOurs(path.normalize(l.slice(0, l.indexOf("(")))))
  const theirs = errors.length - ours.length
  if (theirs) console.log(`(ignoring ${theirs} type error(s) in files the starter app already had)`)
  if (ours.length) {
    console.error(`✗ ${ours.length} type error(s) in installed files:\n${ours.join("\n")}`)
    failed = true
  } else console.log("✓ No type errors in installed files")

  if (nextBuild) {
    log("next build")
    const res = await run("pnpm", ["exec", "next", "build"], { cwd: app, env, allowFail: true })
    if (res.status !== 0) failed = true
  }
} catch (error) {
  console.error(`✗ ${error.message}`)
  failed = true
} finally {
  server.close()
  if (keep) console.log(`\nKept ${app}`)
  else fs.rmSync(tmp, { recursive: true, force: true })
}

console.log(failed ? "\n✗ smoke test failed" : "\n✓ smoke test passed")
process.exit(failed ? 1 : 0)
