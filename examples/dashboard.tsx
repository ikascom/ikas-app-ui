"use client"

import * as React from "react"
import { ArrowRightIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart } from "@/components/ikas/area-chart"
import { BarChart } from "@/components/ikas/bar-chart"
import { BarList } from "@/components/ikas/bar-list"
import { ChartCard } from "@/components/ikas/chart-card"
import { DonutChart } from "@/components/ikas/donut-chart"
import { Layout, LayoutColumn } from "@/components/ikas/layout"
import { Meter } from "@/components/ikas/meter"
import { Page, PageHeader } from "@/components/ikas/page"
import { ResourceTable } from "@/components/ikas/resource-table"
import { Sparkline } from "@/components/ikas/sparkline"
import { StatCard } from "@/components/ikas/stat-card"
import { channelSeries, channels as channelNames, formatMoney, orders, paymentBadge } from "@/demos/_data"

type Range = "7" | "30" | "90"

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value)
const shortDate = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format

/** Deterministic daily revenue ending 6 Ekim 2026, so every range looks like the same store. */
function revenueSeries(days: number) {
  const end = new Date(2026, 9, 6)
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - 1 - i))
    const trend = 4800 + i * (4600 / days)
    const wave = Math.sin(i * 0.9) * 900 + Math.cos(i * 0.37) * 650
    const weekend = date.getDay() % 6 === 0 ? 1500 : 0
    return { date: shortDate(date), revenue: Math.round(trend + wave + weekend) }
  })
}

const revenue: Record<Range, ReturnType<typeof revenueSeries>> = { "7": revenueSeries(7), "30": revenueSeries(30), "90": revenueSeries(90) }
const revenueChange: Record<Range, number> = { "7": 8.4, "30": 12.4, "90": 31.2 }

const channels = [
  { key: "marketplaceA", label: channelNames.marketplaceA, value: 99532 },
  { key: "marketplaceB", label: channelNames.marketplaceB, value: 51610 },
  { key: "web", label: channelNames.web, value: 33178 },
  { key: "marketplaceC", label: channelNames.marketplaceC, value: 12840 },
]

const monthly = ["Nis", "May", "Haz", "Tem", "Ağu", "Eyl"].map((month, i) => ({
  month,
  marketplaceA: Math.round(520 + i * 46 + Math.sin(i * 1.3) * 60),
  marketplaceB: Math.round(300 + i * 22 + Math.cos(i * 0.8) * 40),
  web: Math.round(180 + i * 18 + Math.sin(i * 0.6 + 1) * 30),
}))

const topProducts = [
  { name: "Basic oversize tişört", value: 48230 },
  { name: "Keten gömlek", value: 36110 },
  { name: "Wide leg pantolon", value: 29870 },
  { name: "Kanvas çanta", value: 18420 },
  { name: "Örme hırka", value: 12960 },
]

const spark = (seed: number, rising = true) => Array.from({ length: 14 }, (_, i) => 40 + (rising ? i * 3 : -i * 1.5) + Math.sin(i * 0.9 + seed) * 8)

export default function DashboardExample() {
  const [range, setRange] = React.useState<Range>("30")
  const rows = revenue[range]

  return (
    <Page width="wide">
      <PageHeader title="Genel bakış" description="6 Ekim 2026 itibarıyla tüm satış kanalları." />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          className="animate-panel-enter [--stagger:0]"
          label="Gelir"
          value="₺184.320"
          change={12.4}
          changeLabel="önceki 30 güne göre"
          footer={<Sparkline data={spark(1)} aria-label="Gelir son 14 günde artışta" />}
        />
        <StatCard
          className="animate-panel-enter [--stagger:1]"
          label="Siparişler"
          value="1.208"
          change={-3.1}
          changeLabel="önceki 30 güne göre"
          footer={<Sparkline data={spark(2, false)} aria-label="Siparişler son 14 günde hafif düşüşte" />}
        />
        <StatCard
          className="animate-panel-enter [--stagger:2]"
          label="Ortalama sepet"
          value="₺152,58"
          change={4.2}
          changeLabel="önceki 30 güne göre"
          footer={<Sparkline data={spark(3)} aria-label="Ortalama sepet artışta" />}
        />
        <StatCard
          className="animate-panel-enter [--stagger:3]"
          label="Eşitleme hataları"
          value="7"
          change={-42}
          invertChange
          changeLabel="önceki 30 güne göre"
          footer={<Sparkline data={spark(4, false)} aria-label="Eşitleme hataları azalıyor" />}
        />
      </div>

      <Layout columns="main-aside">
        <ChartCard
          title="Gelir"
          description="Tüm kanallar, günlük"
          value={rows.reduce((sum, r) => sum + r.revenue, 0)}
          valueFormat={money}
          change={revenueChange[range]}
          changeLabel="önceki döneme göre"
          ranges={[
            { value: "7", label: "7G" },
            { value: "30", label: "30G" },
            { value: "90", label: "90G" },
          ]}
          range={range}
          onRangeChange={setRange}
        >
          <AreaChart data={rows} index="date" series={[{ key: "revenue", label: "Gelir" }]} valueFormat={money} height={220} aria-label="Günlük gelir" />
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle>Kanallara göre satış</CardTitle>
            <CardDescription>Son 30 gün</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={channels} valueFormat={money} centerLabel="Toplam" height={200} />
          </CardContent>
        </Card>
      </Layout>

      <Layout columns="main-aside">
        <Card>
          <CardHeader>
            <CardTitle>Aylık siparişler</CardTitle>
            <CardDescription>Kanal bazında, son 6 ay</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={monthly}
              index="month"
              stacked
              height={240}
              series={channelSeries("marketplaceA", "marketplaceB", "web")}
              aria-label="Kanal bazında aylık siparişler"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En çok satan ürünler</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm">
                Tümü
                <ArrowRightIcon data-icon="inline-end" data-anim="nudge" />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <BarList data={topProducts} valueFormat={money} header={{ name: "Ürün", value: "Gelir" }} aria-label="En çok satan ürünler" />
          </CardContent>
        </Card>
      </Layout>

      <Layout columns="main-aside">
        <LayoutColumn>
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Son siparişler</h2>
            <Button variant="ghost" size="sm">
              Tümünü gör
              <ArrowRightIcon data-icon="inline-end" data-anim="nudge" />
            </Button>
          </div>
          <ResourceTable
            label="Son siparişler"
            rows={orders.slice(0, 5)}
            getRowId={(o) => o.id}
            columns={[
              { id: "number", header: "Sipariş", cell: (o) => <span className="font-medium">{o.number}</span> },
              { id: "customer", header: "Müşteri" },
              {
                id: "payment",
                header: "Ödeme",
                cell: (o) => (
                  <Badge tone={paymentBadge[o.payment].tone} dot>
                    {paymentBadge[o.payment].label}
                  </Badge>
                ),
              },
              { id: "total", header: "Toplam", align: "end", cell: (o) => formatMoney(o.total) },
            ]}
          />
        </LayoutColumn>
        <Card>
          <CardHeader>
            <CardTitle>Plan kullanımı</CardTitle>
            <CardDescription>Büyüme planı · yenileme 14 Ekim</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <Meter label="Aylık sipariş" value={1208} max={2000} />
            <Meter label="Ürün" value={4120} max={5000} />
            <Meter label="API istekleri" value={9640} max={10000} />
          </CardContent>
        </Card>
      </Layout>
    </Page>
  )
}
