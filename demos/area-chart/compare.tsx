"use client"

import { AreaChart } from "@/components/ikas/area-chart"
import { channelSeries } from "@/demos/_data"
import { channelOrders } from "@/demos/area-chart/_data"

export default function AreaChartCompare() {
  return (
    <AreaChart
      aria-label="Kanala göre aylık sipariş sayısı"
      data={channelOrders}
      index="month"
      variant="line"
      series={channelSeries("web", "marketplaceA", "marketplaceB")}
      className="w-full"
    />
  )
}
