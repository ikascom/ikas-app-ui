"use client"

import { BarChart } from "@/components/ikas/bar-chart"
import { channelSeries } from "@/demos/_data"
import { channelRevenue, money } from "@/demos/bar-chart/_data"

export default function BarChartStacked() {
  return (
    <div className="w-full">
      <BarChart
        aria-label="Kanallara göre aylık ciro"
        data={channelRevenue}
        index="month"
        stacked
        series={channelSeries("web", "marketplaceA", "marketplaceB")}
        valueFormat={money}
      />
    </div>
  )
}
