#!/usr/bin/env node
/**
 * Writes dist/manifest/*.json, the data builders.ikas.com uses to render the
 * docs pages (demo source, example source, prop tables, item metadata).
 *
 *   demos.json     { "<demo id>": { code } }
 *   examples.json  { "<slug>": { title, description, code } }
 *   props.json     { "<item>": { "<Component>": { description?, props: [...] } } }
 *   items.json     { version, items: [{ name, type, title, ... }] }
 *
 * Run `pnpm registry:build` first: items.json is derived from registry.json.
 */
import fs from "node:fs"
import path from "node:path"
import ts from "typescript"

const root = path.resolve(import.meta.dirname, "..")
const out = path.join(root, "dist/manifest")
const read = (p) => fs.readFileSync(path.join(root, p), "utf8")
const parse = (p) => ts.createSourceFile(p, read(p), ts.ScriptTarget.Latest, true, p.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
const stripUseClient = (code) => code.replace(/^\s*["']use client["'];?[ \t]*\r?\n(\s*\r?\n)?/, "")
const squash = (text) => text.replace(/\s+/g, " ").trim()
const nameOf = (prop) => (prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) ? prop.name.text : undefined)
let warnings = 0
const warn = (msg) => (warnings++, console.warn(`warn: ${msg}`))

function walkFiles(dir) {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const rel = `${dir}/${entry.name}`
    return entry.isDirectory() ? walkFiles(rel) : [rel]
  })
}

/** Object literal properties of every `export const x = { ... }` in a file. */
function exportedObjectProperties(sf) {
  const props = []
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt) || !stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue
    for (const decl of stmt.declarationList.declarations) {
      let init = decl.initializer
      while (init && (ts.isSatisfiesExpression(init) || ts.isAsExpression(init))) init = init.expression
      if (init && ts.isObjectLiteralExpression(init)) props.push(...init.properties.filter(ts.isPropertyAssignment))
    }
  }
  return props
}

// --- demos -------------------------------------------------------------------

function buildDemos() {
  const files = walkFiles("demos").filter((f) => f.endsWith(".tsx") && !/^(_|index)/.test(path.basename(f)))
  const ids = files.map((f) => f.slice("demos/".length, -".tsx".length)).sort()
  const registered = new Set(
    fs.readdirSync(path.join(root, "demos"))
      .filter((f) => /^index.*\.ts$/.test(f))
      .flatMap((f) => exportedObjectProperties(parse(`demos/${f}`)).map(nameOf))
  )
  for (const id of ids) if (!registered.has(id)) warn(`demos/${id}.tsx is not registered in demos/index*.ts`)
  for (const id of registered) if (!ids.includes(id)) warn(`demo "${id}" is registered but demos/${id}.tsx does not exist`)
  return Object.fromEntries(ids.map((id) => [id, { code: stripUseClient(read(`demos/${id}.tsx`)) }]))
}

// --- examples ----------------------------------------------------------------

function buildExamples() {
  const sf = parse("examples/index.ts")
  const imports = new Map()
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && stmt.importClause?.name) imports.set(stmt.importClause.name.text, stmt.moduleSpecifier.text)
  }
  const result = {}
  for (const prop of exportedObjectProperties(sf)) {
    if (!ts.isObjectLiteralExpression(prop.initializer)) continue
    const fields = {}
    for (const field of prop.initializer.properties) {
      if (!ts.isPropertyAssignment(field)) continue
      const init = field.initializer
      fields[nameOf(field)] = ts.isStringLiteralLike(init) ? init.text : ts.isIdentifier(init) ? init.text : undefined
    }
    const spec = imports.get(fields.Component)
    if (!spec) {
      warn(`example "${nameOf(prop)}" has no resolvable Component import`)
      continue
    }
    const file = `examples/${spec.replace(/^\.\//, "")}.tsx`
    result[nameOf(prop)] = { title: fields.title, description: fields.description, code: stripUseClient(read(file)) }
  }
  return result
}

// --- props -------------------------------------------------------------------

const jsDocText = (node) => {
  const doc = node.jsDoc?.at(-1)
  const text = doc && ts.getTextOfJSDocComment(doc.comment)
  return text ? squash(text) : undefined
}
const deprecated = (node) => node.jsDoc?.some((d) => d.tags?.some((t) => t.tagName.text === "deprecated")) || undefined

/** `const xVariants = cva(base, { variants, defaultVariants })` -> props for VariantProps<typeof xVariants>. */
function cvaProps(decl, sf) {
  const call = decl?.initializer
  const config = call && ts.isCallExpression(call) ? call.arguments[1] : undefined
  if (!config || !ts.isObjectLiteralExpression(config)) return []
  const field = (name) => config.properties.find((p) => ts.isPropertyAssignment(p) && nameOf(p) === name)?.initializer
  const variants = field("variants")
  const defaults = field("defaultVariants")
  if (!variants || !ts.isObjectLiteralExpression(variants)) return []
  return variants.properties.filter(ts.isPropertyAssignment).map((variant) => {
    const values = variant.initializer
    let type = "string"
    if (ts.isObjectLiteralExpression(values)) type = values.properties.map((v) => JSON.stringify(nameOf(v))).join(" | ")
    else if (ts.isIdentifier(values)) type = `keyof typeof ${values.text}`
    const def = defaults && ts.isObjectLiteralExpression(defaults)
      ? defaults.properties.find((p) => ts.isPropertyAssignment(p) && nameOf(p) === nameOf(variant))
      : undefined
    return { name: nameOf(variant), type, optional: true, default: def ? squash(def.initializer.getText(sf)) : undefined, description: jsDocText(variant) }
  })
}

function typeLiteralMembers(members, ctx) {
  return members.filter((m) => ts.isPropertySignature(m) || ts.isMethodSignature(m)).map((m) => ({
    name: nameOf(m) ?? m.name.getText(ctx.sf),
    type: squash(m.type ? m.type.getText(ctx.sf) : "unknown"),
    optional: Boolean(m.questionToken),
    description: jsDocText(m),
    deprecated: deprecated(m),
  }))
}

/** Own members of a props type. Inherited props (React.ComponentProps, Omit<...> etc.) are skipped. */
function ownMembers(typeNode, ctx, seen = new Set()) {
  if (!typeNode) return []
  if (ts.isParenthesizedTypeNode(typeNode)) return ownMembers(typeNode.type, ctx, seen)
  if (ts.isIntersectionTypeNode(typeNode)) return typeNode.types.flatMap((t) => ownMembers(t, ctx, seen))
  if (ts.isTypeLiteralNode(typeNode)) return typeLiteralMembers(typeNode.members, ctx)
  if (ts.isTypeReferenceNode(typeNode) || ts.isExpressionWithTypeArguments(typeNode)) {
    const name = (typeNode.typeName ?? typeNode.expression).getText(ctx.sf)
    if (name === "VariantProps") {
      const arg = typeNode.typeArguments?.[0]
      return arg && ts.isTypeQueryNode(arg) ? cvaProps(ctx.consts.get(arg.exprName.getText(ctx.sf)), ctx.sf) : []
    }
    if (name === "Omit" || name === "Pick") {
      const [base, keys] = typeNode.typeArguments ?? []
      const listed = new Set((keys?.getText(ctx.sf).match(/["'][^"']+["']/g) ?? []).map((k) => k.slice(1, -1)))
      return ownMembers(base, ctx, seen).filter((p) => listed.has(p.name) === (name === "Pick"))
    }
    const local = ctx.types.get(name)
    if (local && !seen.has(name)) {
      seen.add(name)
      if (ts.isTypeAliasDeclaration(local)) return ownMembers(local.type, ctx, seen)
      return [...(local.heritageClauses ?? []).flatMap((h) => h.types.flatMap((t) => ownMembers(t, ctx, seen))), ...typeLiteralMembers(local.members, ctx)]
    }
  }
  return []
}

function componentProps(file) {
  const sf = parse(file)
  const ctx = { sf, types: new Map(), consts: new Map(), functions: new Map() }
  const exported = []
  for (const stmt of sf.statements) {
    if (ts.isTypeAliasDeclaration(stmt) || ts.isInterfaceDeclaration(stmt)) ctx.types.set(stmt.name.text, stmt)
    else if (ts.isFunctionDeclaration(stmt) && stmt.name) ctx.functions.set(stmt.name.text, stmt)
    else if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (!ts.isIdentifier(decl.name)) continue
        ctx.consts.set(decl.name.text, decl)
        const init = decl.initializer
        if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) ctx.functions.set(decl.name.text, Object.assign(init, { jsDocHost: stmt }))
      }
    }
    if (ts.isExportDeclaration(stmt) && !stmt.isTypeOnly && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
      for (const el of stmt.exportClause.elements) if (!el.isTypeOnly) exported.push(el.name.text)
    }
    if (ts.isFunctionDeclaration(stmt) && stmt.name && stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) exported.push(stmt.name.text)
  }

  const result = {}
  for (const name of exported) {
    const fn = ctx.functions.get(name)
    if (!/^[A-Z]/.test(name) || !fn) continue
    const param = fn.parameters[0]
    const props = param ? ownMembers(param.type, ctx) : []
    if (param && ts.isObjectBindingPattern(param.name)) {
      for (const el of param.name.elements) {
        if (!el.initializer) continue
        const key = (el.propertyName ?? el.name).getText(sf)
        const prop = props.find((p) => p.name === key)
        if (prop) prop.default = squash(el.initializer.getText(sf))
      }
    }
    // Deduplicate (a member redeclared in a later intersection part wins) and drop empty fields.
    const byName = new Map(props.map((p) => [p.name, JSON.parse(JSON.stringify(p))]))
    result[name] = { description: jsDocText(fn.jsDocHost ?? fn), props: [...byName.values()] }
    if (!result[name].description) delete result[name].description
  }
  return result
}

function buildProps() {
  const result = {}
  for (const dir of ["registry/ikas", "registry/ui"]) {
    if (!fs.existsSync(path.join(root, dir))) continue
    for (const f of fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(".tsx")).sort()) {
      const components = componentProps(`${dir}/${f}`)
      if (Object.keys(components).length) result[f.replace(/\.tsx$/, "")] = components
    }
  }
  return result
}

// --- items -------------------------------------------------------------------

function buildItems() {
  if (!fs.existsSync(path.join(root, "registry.json"))) throw new Error("registry.json missing, run `pnpm registry:build` first")
  const registry = JSON.parse(read("registry.json"))
  const keys = ["name", "type", "title", "description", "categories", "dependencies", "registryDependencies", "docs"]
  return {
    version: JSON.parse(read("package.json")).version,
    items: registry.items.map((item) => Object.fromEntries(keys.filter((k) => item[k] !== undefined).map((k) => [k, item[k]]))),
  }
}

// --- write -------------------------------------------------------------------

fs.mkdirSync(out, { recursive: true })
const outputs = { demos: buildDemos(), examples: buildExamples(), props: buildProps(), items: buildItems() }
for (const [name, data] of Object.entries(outputs)) {
  fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(data, null, 2) + "\n")
  const count = name === "items" ? data.items.length : Object.keys(data).length
  console.log(`dist/manifest/${name}.json: ${count} entries`)
}
if (warnings) console.warn(`${warnings} warning(s)`)
