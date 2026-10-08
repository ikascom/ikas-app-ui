"use client"

import * as React from "react"
import { DownloadIcon, GlobeIcon, MailIcon, MegaphoneIcon, MonitorIcon, SearchIcon, SmartphoneIcon, TabletIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart } from "@/components/ikas/area-chart"
import { BarChart } from "@/components/ikas/bar-chart"
import { BarList } from "@/components/ikas/bar-list"
import { ChartCard } from "@/components/ikas/chart-card"
import { DonutChart } from "@/components/ikas/donut-chart"
import { Layout } from "@/components/ikas/layout"
import { Page, PageHeader } from "@/components/ikas/page"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { Sparkline } from "@/components/ikas/sparkline"
import { StatCard } from "@/components/ikas/stat-card"

type Range = "7" | "30" | "90"

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value)
const number = (value: number) => new Intl.NumberFormat("tr-TR").format(value)
const shortDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format

/** Deterministic series so the server and client render the same chart. */
const wave = (i: number, seed: number) => Math.sin(i * 0.7 + seed) * 0.6 + Math.sin(i * 1.9 + seed * 2) * 0.25

function revenue(days: number) {
  const end = new Date(2026, 9, 6)
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - 1 - i))
    return {
      date: shortDate(date),
      current: Math.round(6200 + i * (3800 / days) + wave(i, 1) * 1300),
      previous: Math.round(5600 + i * (2400 / days) + wave(i, 2.4) * 1100),
    }
  })
}

const revenueByRange: Record<Range, ReturnType<typeof revenue>> = { "7": revenue(7), "30": revenue(30), "90": revenue(90) }

const scale: Record<Range, number> = { "7": 0.24, "30": 1, "90": 2.9 }

const funnel = [
  { step: "Ziyaret", value: 48210 },
  { step: "Ürün görüntüleme", value: 21480 },
  { step: "Sepete ekleme", value: 6320 },
  { step: "Ödeme adımı", value: 2910 },
  { step: "Sipariş", value: 1208 },
]

const devices = [
  { key: "mobile", label: "Mobil", value: 31240 },
  { key: "desktop", label: "Masaüstü", value: 14320 },
  { key: "tablet", label: "Tablet", value: 2650 },
]

const sources = [
  { name: "Organik arama", value: 18430, icon: <SearchIcon className="size-4 text-icon" /> },
  { name: "Doğrudan", value: 11290, icon: <GlobeIcon className="size-4 text-icon" /> },
  { name: "Sosyal medya", value: 9870, icon: <MegaphoneIcon className="size-4 text-icon" /> },
  { name: "E-posta", value: 5140, icon: <MailIcon className="size-4 text-icon" /> },
  { name: "Ücretli reklam", value: 3480, icon: <MonitorIcon className="size-4 text-icon" /> },
]

type CategoryRow = { id: string; name: string; revenue: number; orders: number; change: number; trend: number[] }

const categories: CategoryRow[] = [
  { id: "c1", name: "Tişört", revenue: 62140, orders: 418, change: 14.2, trend: [8, 9, 9, 11, 10, 12, 13, 12, 14, 15, 15, 17] },
  { id: "c2", name: "Gömlek", revenue: 48310, orders: 233, change: 6.1, trend: [10, 10, 11, 10, 11, 12, 11, 12, 12, 13, 12, 13] },
  { id: "c3", name: "Pantolon", revenue: 39880, orders: 187, change: -2.4, trend: [12, 12, 11, 12, 11, 11, 10, 11, 10, 10, 11, 10] },
  { id: "c4", name: "Çanta", revenue: 21450, orders: 162, change: 22.8, trend: [4, 5, 5, 6, 6, 7, 8, 8, 9, 10, 11, 12] },
  { id: "c5", name: "Aksesuar", revenue: 12540, orders: 208, change: -8.9, trend: [9, 9, 8, 8, 8, 7, 7, 7, 6, 6, 6, 5] },
]

const deviceIcon = { mobile: SmartphoneIcon, desktop: MonitorIcon, tablet: TabletIcon }

export default function AnalyticsExample() {
  const [range, setRange] = React.useState<Range>("30")
  const rows = revenueByRange[range]
  const total = rows.reduce((sum, r) => sum + r.current, 0)
  const previousTotal = rows.reduce((sum, r) => sum + r.previous, 0)
  const s = scale[range]

  const columns: RecordTableColumn<CategoryRow>[] = [
    { id: "name", header: "Kategori", cell: (c) => <span className="font-medium">{c.name}</span> },
    {
      id: "trend",
      header: "Son 12 hafta",
      hideOnMobile: true,
      cell: (c) => (
        <div className="w-28">
          <Sparkline data={c.trend} height={24} reveal={false} aria-label={`${c.name} son 12 hafta ${c.change >= 0 ? "artışta" : "düşüşte"}`} />
        </div>
      ),
    },
    { id: "orders", header: "Sipariş", align: "end", cell: (c) => <span className="tabular-nums">{number(Math.round(c.orders * s))}</span> },
    { id: "revenue", header: "Gelir", align: "end", cell: (c) => <span className="tabular-nums">{money(Math.round(c.revenue * s))}</span> },
    {
      id: "change",
      header: "Değişim",
      align: "end",
      cell: (c) => (
        <Badge status={c.change >= 0 ? "success" : "danger"} variant="soft">
          {c.change >= 0 ? "+" : "−"}%{Math.abs(c.change).toLocaleString("tr-TR")}
        </Badge>
      ),
    },
  ]

  return (
    <Page width="wide">
      <PageHeader
        title="Satış analitiği"
        description="Mağaza trafiği, dönüşüm ve kategori performansı."
        actions={
          <>
            <SegmentedControl
              aria-label="Dönem"
              mode="radio"
              value={range}
              onValueChange={setRange}
              options={[
                { value: "7", label: "7 gün" },
                { value: "30", label: "30 gün" },
                { value: "90", label: "90 gün" },
              ]}
            />
            <Button variant="outline" onClick={() => toast.success("Rapor hazırlanıyor, e-posta ile gönderilecek")}>
              <DownloadIcon data-icon="inline-start" data-anim="drop" />
              Rapor al
            </Button>
          </>
        }
      />

      {/* Keyed by range so the stat row re-enters with its stagger when the period changes. */}
      <div key={range} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard className="animate-panel-enter [--stagger:0]" label="Ziyaretçi" value={number(Math.round(48210 * s))} change={9.8} changeLabel="önceki döneme göre" footer={<Sparkline data={[30, 32, 31, 35, 34, 38, 37, 41, 40, 44, 43, 47]} aria-label="Ziyaretçi artışta" />} />
        <StatCard className="animate-panel-enter [--stagger:1]" label="Dönüşüm oranı" value="%2,51" change={0.3} changeLabel="puan" footer={<Sparkline data={[22, 23, 22, 24, 23, 24, 25, 24, 25, 25, 26, 25]} aria-label="Dönüşüm oranı yatay" />} />
        <StatCard className="animate-panel-enter [--stagger:2]" label="Gelir" value={money(total)} change={Number((((total - previousTotal) / previousTotal) * 100).toFixed(1))} changeLabel="önceki döneme göre" footer={<Sparkline data={rows.slice(-12).map((r) => r.current)} aria-label="Gelir artışta" />} />
        <StatCard className="animate-panel-enter [--stagger:3]" label="İade oranı" value="%3,2" change={-0.7} invertChange changeLabel="puan" footer={<Sparkline data={[40, 39, 41, 38, 37, 36, 37, 35, 34, 34, 33, 32]} aria-label="İade oranı düşüşte" />} />
      </div>

      <ChartCard
        title="Gelir"
        description="Bu dönem ile önceki dönem"
        value={total}
        valueFormat={money}
        change={Number((((total - previousTotal) / previousTotal) * 100).toFixed(1))}
        changeLabel="önceki döneme göre"
      >
        <AreaChart
          key={range}
          data={rows}
          index="date"
          series={[
            { key: "current", label: "Bu dönem" },
            { key: "previous", label: "Önceki dönem" },
          ]}
          valueFormat={money}
          height={260}
          aria-label="Bu dönem ve önceki dönem günlük gelir"
        />
      </ChartCard>

      <Layout columns="half">
        <Card>
          <CardHeader>
            <CardTitle>Dönüşüm hunisi</CardTitle>
            <CardDescription>Ziyaretten siparişe, %{((funnel.at(-1)!.value / funnel[0].value) * 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} dönüşüm</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={funnel} index="step" layout="horizontal" series={[{ key: "value", label: "Kullanıcı" }]} valueFormat={number} height={240} aria-label="Dönüşüm hunisi adımları" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cihazlar</CardTitle>
            <CardDescription>Ziyaretlerin cihaz dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={devices} valueFormat={number} centerLabel="Ziyaret" height={200} />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4">
              {devices.map((d) => {
                const Icon = deviceIcon[d.key as keyof typeof deviceIcon]
                return (
                  <div key={d.key} className="flex flex-col items-center gap-1 text-center">
                    <Icon className="size-4 text-icon" />
                    <span className="text-[12px] text-muted-foreground">{d.label} dönüşüm</span>
                    <span className="text-sm font-medium tabular-nums">{d.key === "mobile" ? "%2,1" : d.key === "desktop" ? "%3,4" : "%1,8"}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </Layout>

      <Layout columns="main-aside">
        <RecordTable label="Kategori performansı" columns={columns} rows={categories} getRowId={(c) => c.id} onRowClick={(c) => toast(`${c.name} raporu açılıyor`)} />
        <Card>
          <CardHeader>
            <CardTitle>Trafik kaynakları</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={sources.map((x) => ({ ...x, value: Math.round(x.value * s) }))} valueFormat={number} header={{ name: "Kaynak", value: "Ziyaret" }} aria-label="Trafik kaynakları" />
          </CardContent>
        </Card>
      </Layout>
    </Page>
  )
}
