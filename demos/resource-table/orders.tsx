"use client"

import * as React from "react"
import { InboxIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ikas/empty-state"
import { ResourceTable, type ResourceTableColumn } from "@/components/ikas/resource-table"
import { formatDate, formatMoney, fulfillmentBadge, orders, paymentBadge, type Order } from "@/demos/_data"

const PAGE_SIZE = 5

const columns: ResourceTableColumn<Order>[] = [
  {
    id: "number",
    header: "Sipariş",
    cell: (order) => <span className="font-medium text-foreground">{order.number}</span>,
  },
  { id: "date", header: "Tarih", cell: (order) => formatDate(order.date), hideOnMobile: true },
  { id: "customer", header: "Müşteri" },
  {
    id: "payment",
    header: "Ödeme",
    cell: (order) => (
      <Badge tone={paymentBadge[order.payment].tone} dot>
        {paymentBadge[order.payment].label}
      </Badge>
    ),
  },
  {
    id: "fulfillment",
    header: "Gönderim",
    hideOnMobile: true,
    cell: (order) => (
      <Badge tone={fulfillmentBadge[order.fulfillment].tone}>{fulfillmentBadge[order.fulfillment].label}</Badge>
    ),
  },
  { id: "total", header: "Toplam", align: "end", cell: (order) => formatMoney(order.total) },
]

export default function ResourceTableOrders() {
  const [query, setQuery] = React.useState("")
  const [payment, setPayment] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  const filtered = orders.filter(
    (order) =>
      (payment === "all" || order.payment === payment) &&
      (query === "" || `${order.number} ${order.customer}`.toLowerCase().includes(query.toLowerCase()))
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const first = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1

  function reload() {
    setLoading(true)
    setTimeout(() => setLoading(false), 1200)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <ResourceTable
        label="Siparişler"
        columns={columns}
        rows={rows}
        getRowId={(order) => order.id}
        loading={loading}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onRowClick={(order) => toast(`${order.number} açılıyor`)}
        bulkActions={(ids) => (
          <>
            <Button size="sm" variant="outline" onClick={() => toast.success(`${ids.length} sipariş gönderildi olarak işaretlendi`)}>
              Gönderildi olarak işaretle
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast(`${ids.length} irsaliye yazdırılıyor`)}>
              İrsaliyeleri yazdır
            </Button>
          </>
        )}
        toolbar={
          <>
            <InputGroup className="w-full sm:max-w-64">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Siparişlerde ara"
                placeholder="Siparişlerde ara"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
              />
            </InputGroup>
            <Select
              value={payment}
              onValueChange={(value) => {
                setPayment(value)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Ödeme durumu" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Tüm ödemeler</SelectItem>
                {Object.entries(paymentBadge).map(([value, status]) => (
                  <SelectItem key={value} value={value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
        emptyState={
          <EmptyState
            media={<InboxIcon />}
            title="Sipariş bulunamadı"
            description="Aramayı ya da ödeme filtresini değiştirmeyi deneyin."
            actions={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setPayment("all")
                }}
              >
                Filtreleri temizle
              </Button>
            }
          />
        }
        pagination={{
          page,
          pageCount,
          onPageChange: setPage,
          summary: `${first}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length}`,
        }}
      />
      <div>
        <Button variant="ghost" size="sm" onClick={reload}>
          Yüklenmeyi simüle et
        </Button>
      </div>
    </div>
  )
}
