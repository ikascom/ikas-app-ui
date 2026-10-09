"use client"

import * as React from "react"
import { Columns3Icon, InboxIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ikas/empty-state"
import { RecordTable, type RecordTableColumn, type RecordTableSort } from "@/components/ikas/record-table"
import { formatDate, formatMoney, orderStatusBadge, orders, type Order, type OrderStatus } from "@/demos/_data"

const PAGE_SIZE = 5

const allColumns: RecordTableColumn<Order>[] = [
  { id: "number", header: "Sipariş", sortable: true, cell: (o) => <span className="font-medium text-foreground">{o.number}</span> },
  { id: "date", header: "Tarih", sortable: true, hideOnMobile: true, cell: (o) => formatDate(o.date) },
  { id: "customer", header: "Müşteri", sortable: true },
  {
    id: "status",
    header: "Durum",
    cell: (o) => (
      <Badge status={orderStatusBadge[o.status].status} dot>
        {orderStatusBadge[o.status].label}
      </Badge>
    ),
  },
  { id: "items", header: "Ürün", align: "end", sortable: true, hideOnMobile: true, cell: (o) => <span className="tabular-nums">{o.items}</span> },
  { id: "total", header: "Tutar", align: "end", sortable: true, cell: (o) => <span className="tabular-nums">{formatMoney(o.total)}</span> },
]

/** Column ids that can be hidden; the first column always stays. */
const optional = allColumns.slice(1)

function compare(a: Order, b: Order, id: string) {
  const x = a[id as keyof Order]
  const y = b[id as keyof Order]
  return typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "tr")
}

/**
 * Search, status filter, sortable headers, column visibility and paging, all on the
 * client. With server data, send the same state as query parameters instead.
 */
export default function RecordTableDataTable() {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<OrderStatus | "all">("all")
  const [sort, setSort] = React.useState<RecordTableSort | undefined>({ id: "date", direction: "desc" })
  const [hidden, setHidden] = React.useState<string[]>(["items"])
  const [page, setPage] = React.useState(1)

  const filtered = React.useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr")
    const rows = orders.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!q || o.number.toLocaleLowerCase("tr").includes(q) || o.customer.toLocaleLowerCase("tr").includes(q))
    )
    if (!sort) return rows
    return [...rows].sort((a, b) => compare(a, b, sort.id) * (sort.direction === "asc" ? 1 : -1))
  }, [query, status, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
  const columns = allColumns.filter((c) => !hidden.includes(c.id))
  const from = filtered.length ? (current - 1) * PAGE_SIZE + 1 : 0

  return (
    <RecordTable
      className="w-full"
      label="Siparişler"
      columns={columns}
      rows={rows}
      getRowId={(o) => o.id}
      sort={sort}
      onSortChange={(next) => {
        setSort(next)
        setPage(1)
      }}
      toolbar={
        <>
          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Sipariş no veya müşteri"
              aria-label="Siparişlerde ara"
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
              setStatus(value as OrderStatus | "all")
              setPage(1)
            }}
          >
            <SelectTrigger aria-label="Durum">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm durumlar</SelectItem>
              {Object.entries(orderStatusBadge).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Columns3Icon data-icon="inline-start" />
                Kolonlar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Gösterilen kolonlar</DropdownMenuLabel>
              {optional.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={!hidden.includes(column.id)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    setHidden((ids) => (checked ? ids.filter((id) => id !== column.id) : [...ids, column.id]))
                  }
                >
                  {column.header}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
      emptyState={
        <EmptyState
          media={<InboxIcon />}
          title="Sonuç yok"
          description="Aramayı veya durum filtresini değiştirin."
        />
      }
      pagination={{
        page: current,
        pageCount,
        onPageChange: setPage,
        summary: `${from}–${Math.min(current * PAGE_SIZE, filtered.length)} / ${filtered.length}`,
      }}
    />
  )
}
