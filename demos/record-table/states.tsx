"use client"


import { PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ikas/empty-state"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"

type Product = { id: string; name: string; stock: number }

const columns: RecordTableColumn<Product>[] = [
  { id: "name", header: "Ürün" },
  { id: "stock", header: "Stok", align: "end" },
]

export default function RecordTableStates() {
  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      <RecordTable label="Ürünler (yükleniyor)" columns={columns} rows={[]} getRowId={(p) => p.id} loading />
      <RecordTable
        label="Ürünler (boş)"
        columns={columns}
        rows={[]}
        getRowId={(p) => p.id}
        emptyState={
          <EmptyState
            size="inline"
            media={<PackageIcon />}
            title="Henüz eşitlenen ürün yok"
            actions={<Button size="sm">Eşitlemeyi başlat</Button>}
          />
        }
      />
    </div>
  )
}
