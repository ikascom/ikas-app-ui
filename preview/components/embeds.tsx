import { existsSync } from "node:fs"
import fs from "node:fs/promises"
import path from "node:path"
import { CheckIcon, InboxIcon, PlusIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ikas/empty-state"
import { Page, PageHeader } from "@/components/ikas/page"
import { StatCard } from "@/components/ikas/stat-card"
import { EasingPlayground } from "@/preview/easing-playground"

/*
 * Visual blocks of the principles, tokens and motion pages, served at /preview/embed/<name>
 * so the ikas developer docs can embed them next to their MDX prose.
 */

async function readTokens() {
  // `next build preview` may run with the repo root or preview/ as cwd.
  const candidates = [path.join(process.cwd(), "registry/theme.css"), path.join(process.cwd(), "../registry/theme.css")]
  const file = candidates.find((candidate) => existsSync(candidate))
  if (!file) throw new Error("registry/theme.css not found")
  const css = await fs.readFile(file, "utf8")
  const block = (selector: string): Record<string, string> => {
    const start = css.indexOf(`${selector} {`)
    const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("\n}", start))
    return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]))
  }
  // Light values, and the `.dark` overrides for previews opened with ?theme=dark.
  return { light: block(":root"), dark: block(".dark") }
}

function Comparison({ slop, ikas }: { slop: React.ReactNode; ikas: React.ReactNode }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <figure className="flex flex-col overflow-hidden rounded-xl border">
        <figcaption className="flex items-center gap-1.5 border-b bg-danger-subtle px-3 py-2 text-[13px] font-medium text-danger-subtle-foreground">
          <XIcon className="size-3.5" /> Tipik AI çıktısı
        </figcaption>
        <div className="flex flex-1 items-center justify-center bg-white p-6 text-zinc-900">{slop}</div>
      </figure>
      <figure className="flex flex-col overflow-hidden rounded-xl border">
        <figcaption className="flex items-center gap-1.5 border-b bg-success-subtle px-3 py-2 text-[13px] font-medium text-success-subtle-foreground">
          <CheckIcon className="size-3.5" /> ikas bileşenleriyle
        </figcaption>
        <div className="flex flex-1 items-center justify-center bg-background p-6">{ikas}</div>
      </figure>
    </div>
  )
}

function ComparisonPageHeader() {
  return (
    <Comparison
      slop={
        <div className="w-full text-center">
          <p className="text-xs font-bold tracking-widest text-fuchsia-600 uppercase">Kampanya Yöneticisi</p>
          <h4 className="mt-2 bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-3xl font-extrabold text-transparent">
            Satışlarını Uçur!
          </h4>
          <div className="mt-4 flex justify-center gap-2">
            <button className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/30">
              Hemen Başla
            </button>
            <button className="rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              Daha Fazla
            </button>
          </div>
        </div>
      }
      ikas={
        <Page width="full" className="p-0 sm:p-0">
          <PageHeader
            title="Kampanyalar"
            description="Ödeme adımında otomatik uygulanan indirimler."
            actions={
              <Button>
                <PlusIcon data-icon="inline-start" />
                Kampanya oluştur
              </Button>
            }
          />
        </Page>
      }
    />
  )
}

function ComparisonMetric() {
  return (
    <Comparison
      slop={
        <div className="w-full rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-2xl">
          <p className="text-sm font-medium opacity-90">Toplam Gelir</p>
          <p className="mt-2 text-5xl font-black">₺184K</p>
          <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">Harika büyüme!</p>
        </div>
      }
      ikas={<StatCard className="w-full" label="Gelir" value="₺184.320" change={12.4} changeLabel="son 30 güne göre" />}
    />
  )
}

function ComparisonEmpty() {
  return (
    <Comparison
      slop={
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xl font-bold">Hay aksi! Burada henüz bir şey yok!</p>
          <p className="text-sm text-zinc-500">Görünüşe göre hiç siparişin yok. Merak etme, gelecekler!</p>
          <button className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg">
            Hadi Başlayalım!
          </button>
        </div>
      }
      ikas={
        <Card className="w-full py-0">
          <EmptyState
            media={<InboxIcon />}
            title="Henüz sipariş yok"
            description="Tüm satış kanallarından gelen siparişler burada görünür."
            actions={<Button variant="outline">Test siparişi oluştur</Button>}
          />
        </Card>
      }
    />
  )
}

const surfaces = ["background", "card", "muted", "foreground", "muted-foreground", "icon", "border", "border-strong", "input", "ring"]

async function TokensSurfaces() {
  const tokens = await readTokens()
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-5">
      {surfaces.map((token) => (
        <div key={token} className="flex flex-col gap-1.5">
          <div className="h-12 rounded-lg shadow-[inset_0_0_0_1px_var(--shade-border)]" style={{ background: `var(--${token})` }} />
          <div className="flex flex-col">
            <span className="truncate font-mono text-[11.5px] font-medium">{token}</span>
            <span className="truncate font-mono text-[11px] text-muted-foreground dark:hidden">{tokens.light[token]}</span>
            <span className="hidden truncate font-mono text-[11px] text-muted-foreground dark:block">
              {tokens.dark[token] ?? tokens.light[token]}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const palette = ["neutral", "blue", "violet", "green", "lime", "amber", "red"] as const
const paletteSuffixes = ["", "-subtle", "-subtle-foreground", "-border"] as const

function TokensPalette() {
  return (
    <div className="grid grid-cols-[auto_repeat(4,minmax(0,1fr))] items-center gap-x-3 gap-y-3">
      <span />
      {["solid", "subtle", "subtle-foreground", "border"].map((label) => (
        <span key={label} className="truncate font-mono text-[11px] text-muted-foreground">
          {label}
        </span>
      ))}
      {palette.map((color) => (
        <div key={color} className="contents">
          <span className="pr-3 font-mono text-[12px] font-medium">{color}</span>
          {paletteSuffixes.map((suffix) => (
            <div
              key={suffix}
              title={`--${color}${suffix}`}
              className="h-9 rounded-md shadow-[inset_0_0_0_1px_var(--shade-border)]"
              style={{ background: `var(--${color}${suffix})` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const statuses = [
  { status: "info", color: "blue", use: "Bilgi, planlandı, devam ediyor." },
  { status: "success", color: "green", use: "Tamamlandı, sağlıklı, ödendi, aktif." },
  { status: "warning", color: "amber", use: "Yakında ilgi istiyor: beklemede, süresi doluyor, kısmi." },
  { status: "danger", color: "red", use: "Bozuk, başarısız, geri alınamaz." },
]

function TokensStatuses() {
  return (
    <div className="divide-y rounded-lg bg-card shadow-card">
      {statuses.map(({ status, color, use }) => (
        <div key={status} className="flex items-center gap-4 px-4 py-3">
          <span className="size-3 shrink-0 rounded-full" style={{ background: `var(--${status})` }} />
          <code className="w-20 shrink-0 font-mono text-[13px] font-medium">{status}</code>
          <span className="flex-1 text-sm text-muted-foreground">{use}</span>
          <code className="font-mono text-[12px] text-muted-foreground">→ {color}</code>
        </div>
      ))}
    </div>
  )
}

function TokensChart() {
  return (
    <div className="flex overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_var(--shade-border)]">
      {["chart-ink", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"].map((token, i) => (
        <div key={token} className="flex h-16 flex-1 items-end p-2" style={{ background: `var(--${token})`, marginLeft: i === 1 ? 6 : 0 }}>
          <code className="rounded bg-card/90 px-1 font-mono text-[10.5px] text-foreground">{token}</code>
        </div>
      ))}
    </div>
  )
}

const elevation = [
  { name: "shadow-card", use: "Kartlar, tablolar", className: "bg-card shadow-card" },
  { name: "shadow-raised", use: "Outline butonlar, select, aktif sekmeler", className: "bg-card shadow-raised" },
  { name: "shadow-solid", use: "Solid butonlar, kendi renginde glow", className: "bg-(--c) bg-linear-to-b from-white/14 to-transparent shadow-solid [--c:var(--neutral)]" },
  { name: "shadow-inset", use: "Input'lar, basılı durumlar", className: "bg-card shadow-inset ring-1 ring-input" },
  { name: "shadow-overlay", use: "Menüler, popover'lar, dialog'lar", className: "bg-popover shadow-overlay" },
]

function TokensElevation() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
      {elevation.map((e) => (
        <div key={e.name} className="flex flex-col gap-2.5">
          <div className={`h-16 rounded-lg ${e.className}`} />
          <div className="flex flex-col">
            <code className="font-mono text-[11.5px] font-medium">{e.name}</code>
            <span className="text-[12px] text-muted-foreground">{e.use}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

const typeScale = [
  { name: "Sayfa başlığı", className: "text-xl font-semibold tracking-[-0.01em]", spec: "20 / semibold" },
  { name: "Kart başlığı", className: "text-[15px] font-semibold", spec: "15 / semibold" },
  { name: "Gövde metni", className: "text-sm", spec: "14 / normal" },
  { name: "İkincil metin", className: "text-[13px] text-muted-foreground", spec: "13 / muted" },
  { name: "₺184.320", className: "text-2xl font-semibold tracking-[-0.02em] tabular-nums", spec: "24 / semibold / tabular" },
]

function TokensType() {
  return (
    <div className="divide-y rounded-lg bg-card shadow-card">
      {typeScale.map((t) => (
        <div key={t.name} className="flex items-baseline justify-between gap-4 px-4 py-3">
          <span className={t.className}>{t.name}</span>
          <span className="shrink-0 font-mono text-[12px] text-muted-foreground">{t.spec}</span>
        </div>
      ))}
    </div>
  )
}

export const embeds = {
  "comparison-page-header": ComparisonPageHeader,
  "comparison-metric": ComparisonMetric,
  "comparison-empty": ComparisonEmpty,
  "tokens-surfaces": TokensSurfaces,
  "tokens-palette": TokensPalette,
  "tokens-statuses": TokensStatuses,
  "tokens-chart": TokensChart,
  "tokens-elevation": TokensElevation,
  "tokens-type": TokensType,
  "motion-easing": EasingPlayground,
} as const

export type EmbedName = keyof typeof embeds
