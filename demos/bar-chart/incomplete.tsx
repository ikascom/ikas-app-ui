"use client"

import { BarChart } from "@/components/ikas/bar-chart"
import { monthlyOrders } from "@/demos/bar-chart/_data"

/** 2026 through October; October is still in progress (6 of 31 days). */
const throughOctober = [...monthlyOrders.slice(0, 9), { month: "Eki", orders: 384 }]

export default function BarChartIncomplete() {
  return (
    <div className="w-full">
      <BarChart
        aria-label="Aylık sipariş sayısı, Ocak–Ekim 2026; Ekim devam ediyor"
        data={throughOctober}
        index="month"
        series={[{ key: "orders", label: "Siparişler" }]}
        incompleteLast
        valueFormat={(v) => `${new Intl.NumberFormat("tr-TR").format(v)} sipariş`}
        axisFormat={(v) => new Intl.NumberFormat("tr-TR").format(v)}
      />
    </div>
  )
}
