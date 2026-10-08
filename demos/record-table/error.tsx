"use client"

import * as React from "react"

import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"

type Order = { id: string; customer: string; total: string }

const columns: RecordTableColumn<Order>[] = [
  { id: "id", header: "Sipariş" },
  { id: "customer", header: "Müşteri" },
  { id: "total", header: "Tutar", align: "end" },
]

const rows: Order[] = [
  { id: "#1042", customer: "Ayşe Yılmaz", total: "₺1.240,00" },
  { id: "#1041", customer: "Mehmet Kaya", total: "₺389,90" },
]

/** error replaces the rows with a danger EmptyState; onRetry adds the retry button. */
export default function RecordTableError() {
  const [state, setState] = React.useState<"error" | "loading" | "ready">("error")

  return (
    <RecordTable
      className="w-full"
      label="Siparişler"
      columns={columns}
      rows={state === "ready" ? rows : []}
      getRowId={(o) => o.id}
      loading={state === "loading"}
      error={state === "error"}
      onRetry={() => {
        setState("loading")
        setTimeout(() => setState("ready"), 1200)
      }}
    />
  )
}
