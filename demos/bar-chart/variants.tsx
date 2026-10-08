"use client"

import * as React from "react"

import { BarChart, type BarChartVariant } from "@/components/ikas/bar-chart"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { monthlyOrders } from "@/demos/bar-chart/_data"

export default function BarChartVariants() {
  const [variant, setVariant] = React.useState<BarChartVariant>("solid")

  return (
    <div className="flex w-full flex-col gap-4">
      <SegmentedControl
        size="sm"
        mode="radio"
        aria-label="Dolgu"
        value={variant}
        onValueChange={setVariant}
        options={[
          { value: "solid", label: "Solid" },
          { value: "gradient", label: "Gradient" },
          { value: "duotone", label: "Duotone" },
          { value: "hatched", label: "Hatched" },
        ]}
      />
      <BarChart
        key={variant}
        aria-label="Aylık sipariş sayısı"
        data={monthlyOrders.slice(6)}
        index="month"
        series={[{ key: "orders", label: "Siparişler", color: "var(--chart-1)" }]}
        variant={variant}
        axisFormat={(v) => new Intl.NumberFormat("tr-TR").format(v)}
        height={240}
      />
    </div>
  )
}
