"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type ResourceTableColumn<T> = {
  id: string
  header: React.ReactNode
  /** Cell renderer. Defaults to `String(row[id])`. */
  cell?: (row: T) => React.ReactNode
  align?: "start" | "end"
  /** Tailwind width class, e.g. "w-32". */
  className?: string
  /** Hide below the md breakpoint. Keep the first column always visible. */
  hideOnMobile?: boolean
}

type ResourceTableProps<T> = {
  columns: ResourceTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  /** Accessible name, e.g. "Orders". */
  label: string

  /** Enables checkboxes. Controlled. */
  selectedIds?: string[]
  onSelectedIdsChange?: (ids: string[]) => void
  /** Rendered in the header row while rows are selected. Receives selected ids. */
  bulkActions?: (selectedIds: string[]) => React.ReactNode

  onRowClick?: (row: T) => void
  loading?: boolean
  /** Shown when `rows` is empty and not loading. Usually an EmptyState size="section". */
  emptyState?: React.ReactNode
  /** Search, filters, tabs. Rendered above the table inside the same card. */
  toolbar?: React.ReactNode
  pagination?: {
    page: number
    pageCount: number
    onPageChange: (page: number) => void
    /** e.g. "1–20 of 134" */
    summary?: React.ReactNode
  }
  className?: string
}

function ResourceTable<T>({
  columns,
  rows,
  getRowId,
  label,
  selectedIds,
  onSelectedIdsChange,
  bulkActions,
  onRowClick,
  loading = false,
  emptyState,
  toolbar,
  pagination,
  className,
}: ResourceTableProps<T>) {
  const selectable = Boolean(selectedIds && onSelectedIdsChange)
  const selected = React.useMemo(() => new Set(selectedIds ?? []), [selectedIds])
  const pageIds = rows.map(getRowId)
  const selectedOnPage = pageIds.filter((id) => selected.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someSelected = selectedOnPage > 0 && !allSelected
  const showBulk = selectable && selected.size > 0 && Boolean(bulkActions)
  const colSpan = columns.length + (selectable ? 1 : 0)

  function toggleAll(checked: boolean) {
    if (!onSelectedIdsChange) return
    const next = new Set(selected)
    for (const id of pageIds) {
      if (checked) next.add(id)
      else next.delete(id)
    }
    onSelectedIdsChange([...next])
  }

  function toggleOne(id: string, checked: boolean) {
    if (!onSelectedIdsChange) return
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectedIdsChange([...next])
  }

  return (
    <div
      data-slot="resource-table"
      className={cn("overflow-hidden rounded-xl bg-card shadow-card", className)}
    >
      {toolbar && (
        <div data-slot="resource-table-toolbar" className="flex flex-wrap items-center gap-2 border-b p-3">
          {toolbar}
        </div>
      )}
      <Table aria-label={label} aria-busy={loading || undefined}>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            {selectable && (
              <TableHead className="w-10 pr-0 pl-4">
                <Checkbox
                  aria-label="Bu sayfadaki tüm satırları seç"
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={(value) => toggleAll(value === true)}
                  disabled={loading || rows.length === 0}
                />
              </TableHead>
            )}
            {showBulk ? (
              <TableHead colSpan={columns.length} className="py-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-foreground">{selected.size} seçildi</span>
                  <div className="flex items-center gap-1.5">{bulkActions?.([...selected])}</div>
                </div>
              </TableHead>
            ) : (
              columns.map((column, index) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.align === "end" && "text-right",
                    column.hideOnMobile && "hidden md:table-cell",
                    index === 0 && !selectable && "pl-4",
                    index === columns.length - 1 && "pr-4",
                    column.className
                  )}
                >
                  {column.header}
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
        <TableBody key={loading ? "loading" : "rows"} className="animate-in duration-200 ease-(--ease-out) fade-in-0 motion-reduce:animate-none">
          {loading ? (
            Array.from({ length: 5 }, (_, i) => (
              <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                {selectable && (
                  <TableCell className="pl-4">
                    <Skeleton className="size-4 rounded-[4px]" />
                  </TableCell>
                )}
                {columns.map((column, index) => (
                  <TableCell
                    key={column.id}
                    className={cn(column.hideOnMobile && "hidden md:table-cell", index === 0 && !selectable && "pl-4")}
                  >
                    <Skeleton className={cn("h-4", index === 0 ? "w-32" : "w-16", column.align === "end" && "ml-auto")} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="p-0 whitespace-normal">
                {emptyState ?? <p className="px-4 py-10 text-center text-sm text-muted-foreground">No results</p>}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const id = getRowId(row)
              const isSelected = selected.has(id)
              return (
                <TableRow
                  key={id}
                  data-state={isSelected ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer", "data-[state=selected]:bg-muted")}
                >
                  {selectable && (
                    <TableCell className="w-10 pr-0 pl-4" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label="Satırı seç"
                        checked={isSelected}
                        onCheckedChange={(value) => toggleOne(id, value === true)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, index) => (
                    <TableCell
                      key={column.id}
                      className={cn(
                        column.align === "end" && "text-right tabular-nums",
                        column.hideOnMobile && "hidden md:table-cell",
                        index === 0 && !selectable && "pl-4",
                        index === columns.length - 1 && "pr-4",
                        column.className
                      )}
                    >
                      {column.cell ? column.cell(row) : String((row as Record<string, unknown>)[column.id] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      {pagination && pagination.pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
          <p className="text-[13px] text-muted-foreground tabular-nums">
            {pagination.summary ?? `Sayfa ${pagination.page} / ${pagination.pageCount}`}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Önceki sayfa"
              disabled={loading || pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Sonraki sayfa"
              disabled={loading || pagination.page >= pagination.pageCount}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { ResourceTable, type ResourceTableColumn, type ResourceTableProps }
