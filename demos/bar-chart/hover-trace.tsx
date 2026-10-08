"use client"

import { BarChart } from "@/components/ikas/bar-chart"
import { monthlyOrders } from "@/demos/bar-chart/_data"

export default function BarChartHoverTrace() {
  return (
    <div className="w-full">
      <BarChart
        aria-label="Aylık sipariş sayısı, 2026"
        data={monthlyOrders}
        index="month"
        series={[{ key: "orders", label: "Siparişler" }]}
        valueFormat={(v) => `${new Intl.NumberFormat("tr-TR").format(v)} sipariş`}
        axisFormat={(v) => new Intl.NumberFormat("tr-TR").format(v)}
      />
    </div>
  )
}
