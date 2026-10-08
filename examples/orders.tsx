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
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { channelSyncBadge, formatDate, formatMoney, orderStatusBadge, orders, type Order } from "@/demos/_data"

const columns: RecordTableColumn<Order>[] = [
  { id: "number", header: "Sipariş", cell: (o) => <span className="font-medium text-foreground">{o.number}</span> },
  { id: "date", header: "Tarih", hideOnMobile: true, cell: (o) => formatDate(o.date) },
  { id: "customer", header: "Müşteri" },
  {
    id: "status",
    header: "Durum",
    cell: (o) => (
      <Badge status={orderStatusBadge[o.status].status} dot>
        {orderStatusBadge[o.status].label}
      </Badge>
    ),
  },
  {
    id: "sync",
    header: "Pazaryeri",
    hideOnMobile: true,
    cell: (o) =>
      o.sync === "none" ? (
        <span className="text-muted-foreground">Web siparişi</span>
      ) : (
        <Badge variant="surface" status={channelSyncBadge[o.sync].status}>
          {channelSyncBadge[o.sync].label}
        </Badge>
      ),
  },
  { id: "items", header: "Ürün", align: "end", hideOnMobile: true },
  { id: "total", header: "Toplam", align: "end", cell: (o) => formatMoney(o.total) },
]

const toPrepare = (o: Order) => o.status === "approved" || o.status === "preparing"

export default function OrdersExample() {
  const [tab, setTab] = React.useState("all")
  const [query, setQuery] = React.useState("")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const rows = orders.filter(
    (o) =>
      (tab === "all" || (tab === "to-prepare" ? toPrepare(o) : o.sync === "failed")) &&
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
      <Banner
        status="warning"
        title="1 siparişin durumu pazaryerine iletilemedi"
        actions={
          <Button size="sm" variant="outline" onClick={() => setTab("failed")}>
            Siparişi incele
          </Button>
        }
      >
        Pazaryeri kargo takip numarasını geçersiz buldu. Numarayı düzeltip yeniden iletin.
      </Banner>
      <RecordTable
        label="Siparişler"
        columns={columns}
        rows={rows}
        getRowId={(o) => o.id}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onRowClick={(o) => toast(`${o.number} açılıyor`)}
        bulkActions={(ids) => (
          <Button size="sm" variant="outline" onClick={() => toast.success(`${ids.length} sipariş kargoya verildi`)}>
            Kargoya verildi olarak işaretle
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
                { value: "to-prepare", label: "Hazırlanacak", badge: orders.filter(toPrepare).length },
                { value: "failed", label: "İletilemedi", badge: orders.filter((o) => o.sync === "failed").length },
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
