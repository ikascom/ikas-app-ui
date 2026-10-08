"use client"

import * as React from "react"

import { Switch } from "@/components/ui/switch"
import { AreaChart } from "@/components/ikas/area-chart"
import { dailyRevenue, lira, liraCompact, shortDate } from "@/demos/area-chart/_data"

export default function AreaChartLoading() {
  const [loading, setLoading] = React.useState(true)

  return (
    <div className="flex w-full flex-col gap-4">
      <label className="flex w-fit items-center gap-2.5 text-sm">
        <Switch checked={loading} onCheckedChange={setLoading} />
        Yükleniyor
      </label>
      <AreaChart
        aria-label="Eylül ayı günlük ciro"
        loading={loading}
        data={dailyRevenue}
        index="date"
        series={[{ key: "revenue", label: "Ciro" }]}
        valueFormat={lira}
        yFormat={liraCompact}
        xFormat={shortDate}
        height={200}
      />
    </div>
  )
}
