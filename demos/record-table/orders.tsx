"use client"

import * as React from "react"
import { InboxIcon, SearchIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ikas/empty-state"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { channelSyncBadge, formatDate, formatMoney, orderStatusBadge, orders, type Order } from "@/demos/_data"

const PAGE_SIZE = 5

const columns: RecordTableColumn<Order>[] = [
  {
    id: "number",
    header: "Sipariş",
    cell: (order) => <span className="font-medium text-foreground">{order.number}</span>,
  },
  { id: "date", header: "Tarih", cell: (order) => formatDate(order.date), hideOnMobile: true },
  { id: "customer", header: "Müşteri" },
  {
    id: "status",
    header: "Durum",
    cell: (order) => (
      <Badge status={orderStatusBadge[order.status].status} dot>
        {orderStatusBadge[order.status].label}
      </Badge>
    ),
  },
  {
    id: "sync",
    header: "Pazaryeri",
    hideOnMobile: true,
    cell: (order) =>
      order.sync === "none" ? (
        <span className="text-muted-foreground">Web siparişi</span>
      ) : (
        <Badge variant="surface" status={channelSyncBadge[order.sync].status}>
          {channelSyncBadge[order.sync].label}
        </Badge>
      ),
  },
  { id: "total", header: "Toplam", align: "end", cell: (order) => formatMoney(order.total) },
]

export default function RecordTableOrders() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)

  const filtered = orders.filter(
    (order) =>
      (status === "all" || order.status === status) &&
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
      <RecordTable
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
            <Button size="sm" variant="outline" onClick={() => toast.success(`${ids.length} sipariş kargoya verildi`)}>
              Kargoya verildi olarak işaretle
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
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="Sipariş durumu" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Tüm durumlar</SelectItem>
                {Object.entries(orderStatusBadge).map(([value, badge]) => (
                  <SelectItem key={value} value={value}>
                    {badge.label}
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
            description="Aramayı ya da durum filtresini değiştirmeyi deneyin."
            actions={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setStatus("all")
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
