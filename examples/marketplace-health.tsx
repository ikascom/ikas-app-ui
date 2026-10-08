"use client"

import * as React from "react"
import { BoxesIcon, PackageIcon, RefreshCwIcon, ShoppingCartIcon, TagIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart } from "@/components/ikas/area-chart"
import { Banner } from "@/components/ikas/banner"
import { ChartCard } from "@/components/ikas/chart-card"
import { ExpandableSearch } from "@/components/ikas/expandable-search"
import { RadialMeter } from "@/components/ikas/meter"
import { Page, PageHeader } from "@/components/ikas/page"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { Sparkline } from "@/components/ikas/sparkline"
import { StatCard } from "@/components/ikas/stat-card"
import { ToggleSection } from "@/components/ikas/toggle-section"
import { marketplace } from "@/demos/_data"

type ErrorType = "barcode" | "category" | "price"

type SyncError = { id: string; product: string; sku: string; type: ErrorType; message: string; lastTry: string }

const errorLabel: Record<ErrorType, string> = {
  barcode: "Barkod eksik",
  category: "Kategori eşleşmesi yok",
  price: "Fiyat sınırın altında",
}

const initialErrors: SyncError[] = [
  { id: "e1", product: "Basic oversize tişört · Siyah / M", sku: "TS-1042-BM", type: "barcode", message: "Varyantın barkodu boş.", lastTry: "14:02" },
  { id: "e2", product: "Keten gömlek · Ekru / L", sku: "GM-2210-EL", type: "category", message: "\"Gömlek > Keten\" pazaryeri kategorisiyle eşlenmedi.", lastTry: "13:58" },
  { id: "e3", product: "Kanvas çanta · Naturel", sku: "CN-0091-N", type: "price", message: "₺89,90 kategori alt sınırı ₺99'un altında.", lastTry: "13:41" },
  { id: "e4", product: "Wide leg pantolon · Siyah / 38", sku: "PN-3312-S38", type: "barcode", message: "Barkod başka bir ürünle çakışıyor.", lastTry: "13:20" },
  { id: "e5", product: "Örme hırka · Bej / S", sku: "HR-7781-BS", type: "category", message: "Zorunlu \"Kumaş tipi\" özelliği eksik.", lastTry: "12:47" },
  { id: "e6", product: "Deri kemer · Kahve / 90", sku: "KM-0442-K90", type: "barcode", message: "Varyantın barkodu boş.", lastTry: "12:15" },
]

const day = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format
const activity = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(2026, 8, 23 + i)
  return {
    date: day(date),
    success: Math.round(820 + i * 22 + Math.sin(i * 0.8) * 70),
    failed: Math.max(4, Math.round(38 - i * 1.6 + Math.cos(i * 1.1) * 8)),
  }
})

export default function MarketplaceHealthExample() {
  const [syncing, setSyncing] = React.useState(false)
  const [errors, setErrors] = React.useState(initialErrors)
  const [filter, setFilter] = React.useState<"all" | ErrorType>("all")
  const [query, setQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [retrying, setRetrying] = React.useState<string[]>([])
  const [stock, setStock] = React.useState(true)
  const [price, setPrice] = React.useState(true)
  const [orders, setOrders] = React.useState(true)
  const [autoCategory, setAutoCategory] = React.useState(false)
  const tableRef = React.useRef<HTMLDivElement>(null)

  const count = (t: ErrorType) => errors.filter((e) => e.type === t).length
  const rows = errors.filter(
    (e) => (filter === "all" || e.type === filter) && `${e.product} ${e.sku}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))
  )

  function sync() {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      toast.success("Eşitleme tamamlandı, 1.284 ürün güncel")
    }, 1600)
  }

  function retry(ids: string[]) {
    setRetrying((r) => [...r, ...ids])
    setTimeout(() => {
      setErrors((list) => list.filter((e) => !ids.includes(e.id)))
      setRetrying((r) => r.filter((id) => !ids.includes(id)))
      setSelectedIds([])
      toast.success(ids.length === 1 ? "Ürün yeniden gönderildi" : `${ids.length} ürün yeniden gönderildi`)
    }, 900)
  }

  const columns: RecordTableColumn<SyncError>[] = [
    {
      id: "product",
      header: "Ürün",
      cell: (e) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{e.product}</span>
          <span className="font-mono text-[12px] text-muted-foreground">{e.sku}</span>
        </div>
      ),
    },
    {
      id: "error",
      header: "Hata",
      cell: (e) => (
        <div className="flex min-w-0 flex-col items-start gap-1">
          <Badge status="danger" size="sm">
            {errorLabel[e.type]}
          </Badge>
          <span className="max-w-72 truncate text-[13px] text-muted-foreground">{e.message}</span>
        </div>
      ),
    },
    { id: "lastTry", header: "Son deneme", hideOnMobile: true, cell: (e) => <span className="text-muted-foreground tabular-nums">Bugün {e.lastTry}</span> },
    {
      id: "actions",
      header: <span className="sr-only">Aksiyonlar</span>,
      align: "end",
      cell: (e) => (
        <Button
          size="sm"
          variant="ghost"
          loading={retrying.includes(e.id)}
          onClick={(event) => {
            event.stopPropagation()
            retry([e.id])
          }}
        >
          <RefreshCwIcon data-icon="inline-start" data-anim="spin" />
          Yeniden dene
        </Button>
      ),
    },
  ]

  return (
    <Page width="wide">
      <PageHeader
        title={marketplace.name}
        badges={
          <Badge status="success" dot>
            Bağlı
          </Badge>
        }
        description={`Satıcı ID ${marketplace.sellerId} · son eşitleme 2 dk önce`}
        actions={
          <Button variant="outline" onClick={sync} disabled={syncing}>
            <RefreshCwIcon data-icon="inline-start" data-anim="spin" className={syncing ? "animate-spin motion-reduce:animate-none" : undefined} />
            {syncing ? "Eşitleniyor…" : "Şimdi eşitle"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-panel-enter justify-center [--stagger:0]">
          <CardContent className="flex items-center gap-4">
            <RadialMeter value={94} size={72} strokeWidth={7} status="success" label="Eşitleme sağlığı" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-muted-foreground">Son 24 saat, gönderimlerin %94’ü başarılı</span>
              <span className="text-sm font-medium">İyi durumda</span>
            </div>
          </CardContent>
        </Card>
        <StatCard
          className="animate-panel-enter [--stagger:1]"
          label="Eşlenen ürün"
          value="1.284"
          change={3.2}
          changeLabel="son 14 gün"
          footer={<Sparkline data={[1180, 1190, 1204, 1210, 1222, 1230, 1238, 1245, 1251, 1260, 1266, 1272, 1279, 1284]} aria-label="Eşlenen ürün artışta" />}
        />
        <StatCard
          className="animate-panel-enter [--stagger:2]"
          label="Hatalı ürün"
          value={errors.length === 6 ? "23" : String(23 - (6 - errors.length))}
          change={-38}
          invertChange
          changeLabel="son 14 gün"
          footer={<Sparkline data={[41, 38, 39, 35, 33, 34, 31, 29, 30, 27, 26, 25, 24, 23]} highlightColor="var(--danger)" aria-label="Hatalı ürün azalıyor" />}
        />
        <StatCard
          className="animate-panel-enter [--stagger:3]"
          label="Bekleyen sipariş"
          value="7"
          changeLabel="ikas'a aktarılmayı bekliyor"
          footer={<Sparkline data={[3, 5, 4, 6, 8, 5, 7, 9, 6, 5, 8, 6, 7, 7]} aria-label="Bekleyen sipariş dalgalı" />}
        />
      </div>

      {errors.length > 0 && (
        <Banner
          status="warning"
          title={`${23 - (6 - errors.length)} ürün gönderilemedi`}
          actions={
            <Button size="sm" variant="outline" onClick={() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              Hataları gör
            </Button>
          }
        >
          Pazaryeri bu ürünleri reddetti. Hatayı düzeltip yeniden gönderin; diğer ürünler eşitlenmeye devam ediyor.
        </Banner>
      )}

      <div ref={tableRef} className="scroll-mt-6">
        <RecordTable
          label="Gönderilemeyen ürünler"
          columns={columns}
          rows={rows}
          getRowId={(e) => e.id}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          bulkActions={(ids) => (
            <Button size="sm" variant="outline" loading={ids.some((id) => retrying.includes(id))} onClick={() => retry(ids)}>
              <RefreshCwIcon data-icon="inline-start" data-anim="spin" />
              Yeniden dene
            </Button>
          )}
          toolbar={
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SegmentedControl
                aria-label="Hata türü"
                value={filter}
                onValueChange={setFilter}
                options={[
                  { value: "all", label: "Tümü", badge: errors.length },
                  { value: "barcode", label: "Barkod", badge: count("barcode") },
                  { value: "category", label: "Kategori", badge: count("category") },
                  { value: "price", label: "Fiyat", badge: count("price") },
                ]}
              />
              <ExpandableSearch value={query} onValueChange={setQuery} placeholder="Ürün veya SKU ara" />
            </div>
          }
          emptyState={
            <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
              <span className="text-sm font-medium">Gönderilemeyen ürün yok</span>
              <span className="text-[13px] text-muted-foreground">Tüm ürünler pazaryeriyle eşit.</span>
            </div>
          }
        />
      </div>

      <ChartCard
        title="Eşitleme etkinliği"
        description="Son 14 gün, günlük gönderim"
        value={activity.reduce((sum, d) => sum + d.success, 0)}
        change={-41}
        invertChange
        changeLabel="hatalı gönderim"
      >
        <AreaChart
          data={activity}
          index="date"
          series={[
            { key: "success", label: "Başarılı" },
            { key: "failed", label: "Hatalı" },
          ]}
          height={220}
          aria-label="Son 14 günde başarılı ve hatalı gönderimler"
        />
      </ChartCard>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[15px] font-semibold">Eşitleme ayarları</h2>
          <p className="text-sm text-muted-foreground">Pazaryerine neyin, nasıl gönderileceği.</p>
        </div>
        <ToggleSection icon={<BoxesIcon />} title="Stok eşitleme" description="ikas'taki stok değişikliklerini anında pazaryerine gönderir." checked={stock} onCheckedChange={setStock} />
        <ToggleSection
          icon={<TagIcon />}
          title="Fiyat eşitleme"
          description="Pazaryeri fiyatını ikas fiyatından türetir."
          checked={price}
          onCheckedChange={setPrice}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Fiyat kuralı</span>
              <Select defaultValue="markup">
                <SelectTrigger className="w-full" aria-label="Fiyat kuralı">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="same">ikas fiyatıyla aynı</SelectItem>
                  <SelectItem value="markup">Yüzde ekle</SelectItem>
                  <SelectItem value="discount">İndirimli fiyatı kullan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="markup" className="text-sm font-medium">
                Ek oran (%)
              </label>
              <Input id="markup" inputMode="decimal" defaultValue="12" />
            </div>
          </div>
          <p className="mt-3 text-[13px] text-muted-foreground">Örnek: ₺499,90 olan ürün pazaryerinde ₺559,89 olarak listelenir.</p>
        </ToggleSection>
        <ToggleSection
          icon={<ShoppingCartIcon />}
          title="Sipariş aktarımı"
          description="Pazaryeri siparişlerini ikas'a aktarır, kargo durumunu geri gönderir."
          meta={<Badge size="sm">7 bekliyor</Badge>}
          checked={orders}
          onCheckedChange={setOrders}
        />
        <ToggleSection
          icon={<PackageIcon />}
          title="Otomatik kategori eşleme"
          description="Yeni ürünlerin kategorisini benzer ürünlere bakarak önerir ve eşler."
          checked={autoCategory}
          onCheckedChange={setAutoCategory}
        />
      </div>
    </Page>
  )
}
