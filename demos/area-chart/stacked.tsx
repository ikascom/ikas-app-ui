"use client"

import { AreaChart } from "@/components/ikas/area-chart"
import { channelSeries } from "@/demos/_data"
import { channelOrders } from "@/demos/area-chart/_data"

export default function AreaChartStacked() {
  return (
    <AreaChart
      aria-label="Kanallara göre toplam sipariş, üst üste"
      data={channelOrders}
      index="month"
      stacked
      variant="solid"
      series={channelSeries("web", "marketplaceA", "marketplaceB")}
      className="w-full"
    />
  )
}
