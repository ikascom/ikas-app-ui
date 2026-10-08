"use client"

import * as React from "react"
import { DownloadIcon, InboxIcon, RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Banner } from "@/components/ikas/banner"
import { ExpandableSearch } from "@/components/ikas/expandable-search"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { EmptyState } from "@/components/ikas/empty-state"
import { Page, PageHeader } from "@/components/ikas/page"
import { ResourceTable, type ResourceTableColumn } from "@/components/ikas/resource-table"
import { formatDate, formatMoney, fulfillmentBadge, orders, paymentBadge, type Order } from "@/demos/_data"

const columns: ResourceTableColumn<Order>[] = [
  { id: "number", header: "Sipariş", cell: (o) => <span className="font-medium text-foreground">{o.number}</span> },
  { id: "date", header: "Tarih", hideOnMobile: true, cell: (o) => formatDate(o.date) },
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
  {
    id: "fulfillment",
    header: "Gönderim",
    hideOnMobile: true,
    cell: (o) => <Badge tone={fulfillmentBadge[o.fulfillment].tone}>{fulfillmentBadge[o.fulfillment].label}</Badge>,
  },
  { id: "items", header: "Ürün", align: "end", hideOnMobile: true },
  { id: "total", header: "Toplam", align: "end", cell: (o) => formatMoney(o.total) },
]

export default function OrdersExample() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const rows = orders.filter(
    (o) =>
      (tab === "all" || (tab === "unfulfilled" ? o.fulfillment !== "fulfilled" : o.payment === "pending")) &&
      `${o.number} ${o.customer}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Page width="wide">
      <PageHeader
        title="Siparişler"
        description="Pazaryeri hesaplarınızdan eşitlenen siparişler."
        actions={
          <>
            <Button variant="outline">
              <DownloadIcon data-icon="inline-start" data-anim="drop" />
              Dışa aktar
            </Button>
            <Button onClick={() => toast.success("Eşitleme başladı")}>
              <RefreshCwIcon data-icon="inline-start" data-anim="spin" />
              Şimdi eşitle
            </Button>
          </>
        }
      />
      <Banner tone="warning" title="2 sipariş eşitlenemedi" actions={<Button size="sm" variant="outline">Siparişleri incele</Button>}>
        Pazaryeri bu siparişler için geçersiz adres döndürdü.
      </Banner>
      <ResourceTable
        label="Siparişler"
        columns={columns}
        rows={rows}
        getRowId={(o) => o.id}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onRowClick={(o) => toast(`${o.number} açılıyor`)}
        bulkActions={(ids) => (
          <Button size="sm" variant="outline" onClick={() => toast.success(`${ids.length} sipariş gönderildi olarak işaretlendi`)}>
            Gönderildi olarak işaretle
          </Button>
        )}
        toolbar={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SegmentedControl
              aria-label="Sipariş filtresi"
              value={tab}
              onValueChange={setTab}
              options={[
                { value: "all", label: "Tümü" },
                { value: "unfulfilled", label: "Gönderilmedi", badge: orders.filter((o) => o.fulfillment !== "fulfilled").length },
                { value: "pending", label: "Ödeme bekleyen", badge: orders.filter((o) => o.payment === "pending").length },
              ]}
            />
            <ExpandableSearch value={query} onValueChange={setQuery} placeholder="Siparişlerde ara" />
          </div>
        }
        emptyState={<EmptyState media={<InboxIcon />} title="Sipariş bulunamadı" description="Başka bir sekme ya da arama terimi deneyin." />}
        pagination={{ page: 1, pageCount: 3, onPageChange: () => {}, summary: `1–${rows.length} / 134` }}
      />
    </Page>
  )
}
