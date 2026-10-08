"use client"

import * as React from "react"
import { MegaphoneIcon, PauseIcon, PlusIcon, SettingsIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge, type BadgeTone } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Banner } from "@/components/ikas/banner"
import { BarChart } from "@/components/ikas/bar-chart"
import { ChartCard } from "@/components/ikas/chart-card"
import { EmptyState } from "@/components/ikas/empty-state"
import { ExpandableSearch } from "@/components/ikas/expandable-search"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { Sparkline } from "@/components/ikas/sparkline"
import { Layout } from "@/components/ikas/layout"
import { Page, PageHeader } from "@/components/ikas/page"
import { ResourceTable, type ResourceTableColumn } from "@/components/ikas/resource-table"
import { StatCard } from "@/components/ikas/stat-card"

type CampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED"

type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  impressions: number
  opens: number
  clicks: number
  addToCarts: number
}

const status: Record<CampaignStatus, { label: string; tone: BadgeTone }> = {
  DRAFT: { label: "Taslak", tone: "neutral" },
  ACTIVE: { label: "Yayında", tone: "success" },
  PAUSED: { label: "Duraklatıldı", tone: "warning" },
  ENDED: { label: "Sona erdi", tone: "neutral" },
}

const campaigns: Campaign[] = [
  { id: "c1", name: "Hafta sonu fırsatı", status: "ACTIVE", impressions: 8420, opens: 1934, clicks: 812, addToCarts: 356 },
  { id: "c2", name: "Kargo bedava çantası", status: "ACTIVE", impressions: 3105, opens: 702, clicks: 251, addToCarts: 98 },
  { id: "c3", name: "Yeni sezon tişört", status: "PAUSED", impressions: 1210, opens: 233, clicks: 71, addToCarts: 22 },
  { id: "c4", name: "Kasım indirimi", status: "DRAFT", impressions: 0, opens: 0, clicks: 0, addToCarts: 0 },
  { id: "c5", name: "Sevgililer günü kutusu", status: "ENDED", impressions: 5630, opens: 1120, clicks: 402, addToCarts: 187 },
]

const daily = [320, 410, 380, 520, 610, 580, 720, 690, 810, 760, 905, 880, 1020, 1115].map((impressions, i) => ({
  day: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(2026, 8, 23 + i)),
  impressions,
}))

const number = new Intl.NumberFormat("tr-TR")
const percent = (value: number, total: number) => (total ? `%${((value / total) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}` : "—")

/** One step of the funnel: count plus a hairline bar relative to impressions. */
function FunnelCell({ value, total }: { value: number; total: number }) {
  return (
    <div className="flex min-w-24 flex-col items-end gap-1.5">
      <span className="tabular-nums">{value ? number.format(value) : "—"}</span>
      <span className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-lime" style={{ width: total ? `${(value / total) * 100}%` : 0 }} />
      </span>
    </div>
  )
}

type Tab = "all" | CampaignStatus

export default function CampaignsExample() {
  const [tab, setTab] = React.useState<Tab>("all")
  const [query, setQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const rows = campaigns.filter(
    (c) => (tab === "all" || c.status === tab) && c.name.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))
  )
  const count = (s: CampaignStatus) => campaigns.filter((c) => c.status === s).length

  const totals = campaigns.reduce(
    (sum, c) => ({
      impressions: sum.impressions + c.impressions,
      opens: sum.opens + c.opens,
      addToCarts: sum.addToCarts + c.addToCarts,
    }),
    { impressions: 0, opens: 0, addToCarts: 0 }
  )

  const columns: ResourceTableColumn<Campaign>[] = [
    { id: "name", header: "Kampanya", cell: (c) => <span className="font-medium">{c.name}</span> },
    { id: "status", header: "Durum", cell: (c) => <Badge tone={status[c.status].tone} dot={c.status === "ACTIVE"}>{status[c.status].label}</Badge> },
    { id: "impressions", header: "Görüntülenme", align: "end", cell: (c) => <FunnelCell value={c.impressions} total={c.impressions} /> },
    { id: "opens", header: "Açılma", align: "end", hideOnMobile: true, cell: (c) => <FunnelCell value={c.opens} total={c.impressions} /> },
    { id: "clicks", header: "Tıklama", align: "end", hideOnMobile: true, cell: (c) => <FunnelCell value={c.clicks} total={c.impressions} /> },
    { id: "addToCarts", header: "Sepete ekleme", align: "end", cell: (c) => <FunnelCell value={c.addToCarts} total={c.impressions} /> },
  ]

  return (
    <Page width="wide">
      <PageHeader
        title="Kampanyalar"
        description="Storefront'ta gösterilen fırsat widget'larını yönetin."
        actions={
          <>
            <Button variant="ghost" size="icon" aria-label="Ayarlar">
              <SettingsIcon />
            </Button>
            <Button color="lime" onClick={() => toast.success("Kampanya oluşturuldu")}>
              <PlusIcon data-icon="inline-start" />
              Yeni kampanya
            </Button>
          </>
        }
      />

      <Banner
        tone="warning"
        title="Eksik izinler var"
        actions={
          <Button size="sm" variant="outline">
            İzinleri güncelle
          </Button>
        }
      >
        Uygulamanın çalışması için şu izinler gerekli: read_campaigns, write_campaigns.
      </Banner>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Yayındaki kampanya" value={campaigns.filter((c) => c.status === "ACTIVE").length} changeLabel={`${campaigns.length} kampanya toplam`} />
        <StatCard label="Görüntülenme" value={number.format(totals.impressions)} change={18.2} changeLabel="son 14 gün" footer={<Sparkline data={daily.map((d) => d.impressions)} aria-label="Görüntülenme artışta" />} />
        <StatCard label="Açılma oranı" value={percent(totals.opens, totals.impressions)} change={2.4} changeLabel={`${number.format(totals.opens)} açılma`} />
        <StatCard label="Sepete ekleme oranı" value={percent(totals.addToCarts, totals.impressions)} change={-0.8} changeLabel={`${number.format(totals.addToCarts)} sepete ekleme`} />
      </div>

      <Layout columns="one">
        <ChartCard
          title="Günlük görüntülenme"
          description="Tüm yayındaki kampanyalar"
          value={daily.reduce((sum, d) => sum + d.impressions, 0)}
          change={18.2}
          changeLabel="önceki 14 güne göre"
        >
          <BarChart data={daily} index="day" series={[{ key: "impressions", label: "Görüntülenme" }]} incompleteLast height={200} aria-label="Son 14 günde günlük görüntülenme" />
        </ChartCard>

        <ResourceTable
          label="Kampanyalar"
          columns={columns}
          rows={rows}
          getRowId={(c) => c.id}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onRowClick={(c) => toast(`${c.name} açılıyor`)}
          bulkActions={(ids) => (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toast.success(`${ids.length} kampanya duraklatıldı`)
                setSelectedIds([])
              }}
            >
              <PauseIcon data-icon="inline-start" />
              Duraklat
            </Button>
          )}
          toolbar={
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SegmentedControl
                aria-label="Kampanya durumu"
                value={tab}
                onValueChange={setTab}
                options={[
                  { value: "all", label: "Tümü" },
                  { value: "ACTIVE", label: "Yayında", badge: count("ACTIVE") },
                  { value: "PAUSED", label: "Duraklatıldı", badge: count("PAUSED") },
                  { value: "DRAFT", label: "Taslak", badge: count("DRAFT") },
                ]}
              />
              <ExpandableSearch value={query} onValueChange={setQuery} placeholder="Kampanyalarda ara" />
            </div>
          }
          emptyState={<EmptyState media={<MegaphoneIcon />} title="Kampanya bulunamadı" description="Başka bir sekme ya da arama terimi deneyin." />}
        />
      </Layout>
    </Page>
  )
}
