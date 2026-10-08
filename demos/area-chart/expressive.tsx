"use client"

import { AreaChart } from "@/components/ikas/area-chart"
import { lira, liraCompact, shortDate } from "@/demos/area-chart/_data"

/** Ekim: 1–20 gerçekleşen, 21–31 tahmin. */
const october = Array.from({ length: 31 }, (_, i) => ({
  date: `2026-10-${String(i + 1).padStart(2, "0")}`,
  revenue: Math.round(6100 + i * 110 + Math.sin(i * 0.6) * 900 + Math.sin(i * 1.4 + 1) * 380 + (i % 7 === 3 || i % 7 === 4 ? 1200 : 0)),
}))

export default function AreaChartExpressive() {
  const actual = october.slice(0, 20).reduce((sum, d) => sum + d.revenue, 0)
  const forecast = october.reduce((sum, d) => sum + d.revenue, 0)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted-foreground">Ekim tahmini</span>
          <span className="text-2xl font-semibold tracking-[-0.02em]">{lira(forecast)}</span>
        </div>
        <span className="text-[13px] text-muted-foreground">
          Gerçekleşen <span className="font-medium text-foreground tabular-nums">{lira(actual)}</span> · 11 gün tahmini
        </span>
      </div>
      <AreaChart
        aria-label="Ekim ayı ciro tahmini: ilk 20 gün gerçekleşen, kalan 11 gün tahmin"
        data={october}
        index="date"
        series={[{ key: "revenue", label: "Ciro" }]}
        glow
        background="dots"
        projectedLast={11}
        valueFormat={lira}
        yFormat={liraCompact}
        xFormat={shortDate}
      />
    </div>
  )
}
