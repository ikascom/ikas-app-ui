"use client"

import { AreaChart } from "@/components/ikas/area-chart"
import { dailyRevenue, lira, liraCompact, shortDate } from "@/demos/area-chart/_data"

export default function AreaChartRevenue() {
  const total = dailyRevenue.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] text-muted-foreground">Ciro · Eylül</span>
        <span className="text-2xl font-semibold tracking-[-0.02em]">{lira(total)}</span>
      </div>
      <AreaChart
        aria-label="Eylül ayı günlük ciro, ay boyunca artış eğiliminde"
        data={dailyRevenue}
        index="date"
        series={[{ key: "revenue", label: "Ciro" }]}
        valueFormat={lira}
        yFormat={liraCompact}
        xFormat={shortDate}
      />
    </div>
  )
}
