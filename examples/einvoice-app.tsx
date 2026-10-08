"use client"

import * as React from "react"
import { DownloadIcon, FileTextIcon, MoreHorizontalIcon, RotateCcwIcon, SendIcon, ShieldCheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge, type BadgeStatus } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Banner } from "@/components/ikas/banner"
import { BarChart } from "@/components/ikas/bar-chart"
import { ChartCard } from "@/components/ikas/chart-card"
import { Layout } from "@/components/ikas/layout"
import { Meter } from "@/components/ikas/meter"
import { Page, PageHeader } from "@/components/ikas/page"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { ToggleSection } from "@/components/ikas/toggle-section"
import { orders } from "@/demos/_data"

type InvoiceStatus = "sent" | "pending" | "failed" | "draft"

type Invoice = { id: string; number: string; order: string; customer: string; total: number; status: InvoiceStatus }

const statusBadge: Record<InvoiceStatus, { label: string; status: BadgeStatus }> = {
  sent: { label: "Gönderildi", status: "success" },
  pending: { label: "Bekliyor", status: "warning" },
  failed: { label: "Hatalı", status: "danger" },
  draft: { label: "Taslak", status: "neutral" },
}

/** One invoice per order of the shared demo store. */
const invoiceStatus: InvoiceStatus[] = ["sent", "pending", "failed", "sent", "failed", "draft", "sent"]
const initialInvoices: Invoice[] = orders.slice(0, invoiceStatus.length).map((o, i) => ({
  id: `i${i + 1}`,
  number: invoiceStatus[i] === "draft" ? "—" : `ABC2026${String(418 - i).padStart(9, "0")}`,
  order: o.number,
  customer: o.customer,
  total: o.total,
  status: invoiceStatus[i],
}))

const money = (value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)

const monthly = ["May", "Haz", "Tem", "Ağu", "Eyl", "Eki"].map((month, i) => ({
  month,
  invoices: i === 5 ? 214 : Math.round(820 + i * 64 + Math.sin(i * 1.2) * 70),
}))

export default function EInvoiceAppExample() {
  const [invoices, setInvoices] = React.useState(initialInvoices)
  const [filter, setFilter] = React.useState<"all" | InvoiceStatus>("all")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [auto, setAuto] = React.useState(true)
  const [when, setWhen] = React.useState<"created" | "shipped" | "delivered">("shipped")
  const [refund, setRefund] = React.useState(true)
  const [tckn, setTckn] = React.useState(false)

  const count = (s: InvoiceStatus) => invoices.filter((i) => i.status === s).length
  const failed = count("failed")
  const rows = invoices.filter((i) => filter === "all" || i.status === filter)

  function resend(ids: string[]) {
    setInvoices((list) => list.map((i) => (ids.includes(i.id) && i.status !== "sent" ? { ...i, status: "sent" } : i)))
    setSelectedIds([])
    toast.success(ids.length === 1 ? "Fatura yeniden gönderildi" : `${ids.length} fatura yeniden gönderildi`)
  }

  const columns: RecordTableColumn<Invoice>[] = [
    { id: "number", header: "Fatura no", cell: (i) => <span className="font-mono text-[13px] font-medium">{i.number}</span> },
    { id: "order", header: "Sipariş", cell: (i) => <span className="text-muted-foreground">{i.order}</span> },
    { id: "customer", header: "Müşteri", hideOnMobile: true },
    { id: "total", header: "Tutar", align: "end", cell: (i) => <span className="tabular-nums">{money(i.total)}</span> },
    {
      id: "status",
      header: "Durum",
      cell: (i) => (
        <Badge status={statusBadge[i.status].status} dot={i.status === "pending"}>
          {statusBadge[i.status].label}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Aksiyonlar</span>,
      align: "end",
      cell: (i) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`${i.order} faturası için aksiyonlar`} onClick={(e) => e.stopPropagation()}>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => toast("PDF indiriliyor")}>
              <DownloadIcon />
              PDF indir
            </DropdownMenuItem>
            <DropdownMenuItem disabled={i.status === "sent"} onSelect={() => resend([i.id])}>
              <SendIcon />
              Yeniden gönder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" disabled={i.status !== "sent"} onSelect={() => toast("İade faturası oluşturuldu")}>
              <RotateCcwIcon />
              İade faturası kes
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <Page width="wide">
      <PageHeader
        title="E-fatura"
        description="Siparişleriniz için e-fatura ve e-arşiv faturalarını otomatik keser ve GİB'e iletir."
        actions={
          <Button variant="outline" onClick={() => toast.success("Fatura listesi dışa aktarılıyor")}>
            <DownloadIcon data-icon="inline-start" data-anim="drop" />
            Dışa aktar
          </Button>
        }
      />

      {failed > 0 && (
        <Banner
          status="danger"
          title={`${failed} fatura GİB'e iletilemedi`}
          actions={
            <Button size="sm" variant="outline" onClick={() => resend(invoices.filter((i) => i.status === "failed").map((i) => i.id))}>
              Hepsini yeniden gönder
            </Button>
          }
        >
          Müşteri vergi numarası doğrulanamadı. Bilgileri kontrol edip yeniden gönderin.
        </Banner>
      )}

      <Layout columns="main-aside">
        <ChartCard title="Aylık fatura" description="Son 6 ay, kesilen fatura sayısı" value={monthly.reduce((s, m) => s + m.invoices, 0)} change={9.6} changeLabel="önceki 6 aya göre">
          <BarChart data={monthly} index="month" series={[{ key: "invoices", label: "Fatura" }]} incompleteLast height={220} aria-label="Aylık kesilen fatura sayısı, Ekim devam ediyor" />
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle>Kontör</CardTitle>
            <CardDescription>Her fatura 1 kontör kullanır.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Meter label="Kullanılan kontör" value={8420} max={10000} />
            <p className="text-[13px] text-muted-foreground">Bu hızla kalan kontör yaklaşık 2 hafta yeter.</p>
            <Button variant="link" className="w-fit" onClick={() => toast("Kontör paketleri açılıyor")}>
              Kontör satın al
            </Button>
          </CardContent>
        </Card>
      </Layout>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[15px] font-semibold">Fatura ayarları</h2>
          <p className="text-sm text-muted-foreground">Faturaların ne zaman ve nasıl kesileceği.</p>
        </div>
        <ToggleSection
          icon={<FileTextIcon />}
          title="Otomatik fatura kes"
          description="Siparişler için faturayı seçtiğiniz adımda kendiliğinden keser."
          checked={auto}
          onCheckedChange={setAuto}
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Ne zaman</span>
              <SegmentedControl
                mode="radio"
                aria-label="Fatura kesme zamanı"
                value={when}
                onValueChange={setWhen}
                options={[
                  { value: "created", label: "Sipariş oluşunca" },
                  { value: "shipped", label: "Kargoya verilince" },
                  { value: "delivered", label: "Teslim edilince" },
                ]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Fatura serisi</span>
                <Select defaultValue="iks">
                  <SelectTrigger className="w-full" aria-label="Fatura serisi">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="iks">IKS · e-arşiv</SelectItem>
                    <SelectItem value="efa">EFA · e-fatura</SelectItem>
                    <SelectItem value="ihr">IHR · ihracat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2.5 sm:self-end">
                <span className="text-sm">Müşteriye e-posta gönder</span>
                <Switch defaultChecked aria-label="Müşteriye e-posta gönder" />
              </label>
            </div>
          </div>
        </ToggleSection>
        <ToggleSection
          icon={<RotateCcwIcon />}
          title="İade faturası"
          description="İade onaylandığında iade faturasını otomatik keser."
          checked={refund}
          onCheckedChange={setRefund}
        />
        <ToggleSection
          icon={<ShieldCheckIcon />}
          title="E-arşiv için TCKN zorunlu"
          description="Ödeme adımında bireysel müşterilerden T.C. kimlik numarası ister."
          checked={tckn}
          onCheckedChange={setTckn}
        />
      </div>

      <RecordTable
        label="Faturalar"
        columns={columns}
        rows={rows}
        getRowId={(i) => i.id}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        bulkActions={(ids) => (
          <Button size="sm" variant="outline" onClick={() => resend(ids)}>
            <SendIcon data-icon="inline-start" data-anim="lift" />
            Yeniden gönder
          </Button>
        )}
        toolbar={
          <SegmentedControl
            aria-label="Fatura durumu"
            value={filter}
            onValueChange={setFilter}
            options={[
              { value: "all", label: "Tümü", badge: invoices.length },
              { value: "sent", label: "Gönderildi", badge: count("sent") },
              { value: "pending", label: "Bekliyor", badge: count("pending") },
              { value: "failed", label: "Hatalı", badge: count("failed") },
              { value: "draft", label: "Taslak", badge: count("draft") },
            ]}
          />
        }
        emptyState={
          <div className="flex flex-col items-center gap-1 px-6 py-12 text-center">
            <span className="text-sm font-medium">Bu durumda fatura yok</span>
            <span className="text-[13px] text-muted-foreground">Başka bir durum seçin.</span>
          </div>
        }
      />
    </Page>
  )
}
