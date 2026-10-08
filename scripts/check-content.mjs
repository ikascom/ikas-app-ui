#!/usr/bin/env node
// Fails when demos, examples, registry or preview mention internal app names, internal hosts or
// third-party brands. The registry is public: sample content must stay generic.
// Usage: node scripts/check-content.mjs

import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, extname } from "node:path"
import { fileURLToPath } from "node:url"

/** Forbidden patterns (case-insensitive). Extend here. */
const FORBIDDEN = [
  /apps\.ikas\.dev/i,
  /\brush\b/i,
  /whatsapp/i,
  /localhost:\d+/i,
  /trendyol/i,
  /hepsiburada/i,
]

const ROOTS = ["registry", "demos", "examples", "preview"]
const SKIP_DIRS = new Set(["node_modules", ".next", "out", "dist", ".turbo"])
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".md", ".mdx", ".html"])

const repo = join(fileURLToPath(new URL(".", import.meta.url)), "..")

function* walk(dir) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) yield* walk(path)
    else if (EXTENSIONS.has(extname(name))) yield path
  }
}

const matches = []
for (const root of ROOTS) {
  for (const file of walk(join(repo, root))) {
    const lines = readFileSync(file, "utf8").split("\n")
    lines.forEach((line, i) => {
      for (const pattern of FORBIDDEN) {
        const hit = line.match(pattern)
        if (hit) matches.push(`${relative(repo, file)}:${i + 1}: "${hit[0]}"  ${line.trim().slice(0, 120)}`)
      }
    })
  }
}

if (matches.length) {
  console.error(`check-content: ${matches.length} forbidden match(es)\n`)
  for (const m of matches) console.error(`  ${m}`)
  process.exit(1)
}
console.log("check-content: ok")
