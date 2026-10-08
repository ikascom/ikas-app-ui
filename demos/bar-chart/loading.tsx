"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { BarChart } from "@/components/ikas/bar-chart"
import { monthlyOrders } from "@/demos/bar-chart/_data"

export default function BarChartLoading() {
  const [loading, setLoading] = React.useState(true)

  return (
    <div className="flex w-full flex-col gap-4">
      <Button size="sm" variant="outline" className="self-start" onClick={() => setLoading((v) => !v)}>
        {loading ? "Veriyi göster" : "Yükleniyor durumuna dön"}
      </Button>
      <BarChart aria-label="Aylık sipariş sayısı" data={monthlyOrders} index="month" series={[{ key: "orders", label: "Siparişler" }]} loading={loading} height={220} />
    </div>
  )
}
