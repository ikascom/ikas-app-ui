"use client"

import { BarChart } from "@/components/ikas/bar-chart"
import { categorySales } from "@/demos/bar-chart/_data"

export default function BarChartHorizontal() {
  return (
    <div className="w-full">
      <BarChart
        aria-label="Kategoriye göre satılan adet"
        data={categorySales}
        index="category"
        layout="horizontal"
        series={[{ key: "units", label: "Satılan adet" }]}
        valueFormat={(v) => `${new Intl.NumberFormat("tr-TR").format(v)} adet`}
        height={260}
      />
    </div>
  )
}
