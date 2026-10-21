"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton, SkeletonProvider, type SkeletonVariant } from "@/components/ui/skeleton"
import { BarChart } from "@/components/ikas/bar-chart"
import { RecordTable, type RecordTableColumn } from "@/components/ikas/record-table"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { formatMoney } from "@/demos/_data"
import { monthlyOrders } from "@/demos/bar-chart/_data"

type Product = { id: string; name: string; stock: number }

const columns: RecordTableColumn<Product>[] = [
  { id: "name", header: "Ürün" },
  { id: "stock", header: "Stok", align: "end" },
]

/** One SkeletonProvider sets the look; the table, the chart and wrapped text all follow it. */
export default function SkeletonProviderDemo() {
  const [variant, setVariant] = React.useState<SkeletonVariant>("shimmer")

  return (
    <div className="flex w-full flex-col gap-4">
      <SegmentedControl
        aria-label="İskelet görünümü"
        mode="radio"
        size="sm"
        className="self-start"
        value={variant}
        onValueChange={setVariant}
        options={[
          { value: "pulse", label: "Nabız" },
          { value: "shimmer", label: "Parıltı" },
        ]}
      />
      <SkeletonProvider variant={variant}>
        <div className="grid gap-4 md:grid-cols-2">
          <Card aria-busy>
            <CardHeader>
              <CardTitle>Bu ayki ciro</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton>
                <span className="w-fit text-2xl font-semibold tabular-nums">{formatMoney(48210)}</span>
              </Skeleton>
              <BarChart aria-label="Aylık sipariş sayısı" data={monthlyOrders} index="month" series={[{ key: "orders", label: "Siparişler" }]} loading height={140} />
            </CardContent>
          </Card>
          <RecordTable label="Ürünler" columns={columns} rows={[]} getRowId={(p) => p.id} loading />
        </div>
      </SkeletonProvider>
    </div>
  )
}
