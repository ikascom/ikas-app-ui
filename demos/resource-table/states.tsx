"use client"


import { PackageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ikas/empty-state"
import { ResourceTable, type ResourceTableColumn } from "@/components/ikas/resource-table"

type Product = { id: string; name: string; stock: number }

const columns: ResourceTableColumn<Product>[] = [
  { id: "name", header: "Ürün" },
  { id: "stock", header: "Stok", align: "end" },
]

export default function ResourceTableStates() {
  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      <ResourceTable label="Ürünler (yükleniyor)" columns={columns} rows={[]} getRowId={(p) => p.id} loading />
      <ResourceTable
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
