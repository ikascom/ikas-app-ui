"use client"

import { AreaChart } from "@/components/ikas/area-chart"
import { lira, liraCompact } from "@/demos/area-chart/_data"

const actual = (i: number) => Math.round(21000 + i * 1300 + Math.sin(i * 0.9) * 2600)

/** Weeks 1–8 happened; the forecast starts from week 8 so the lines meet. */
const weeks = Array.from({ length: 12 }, (_, i) => ({
  week: `${i + 1}. hafta`,
  actual: i < 8 ? actual(i) : null,
  target: 22000 + i * 1500,
  forecast: i === 7 ? actual(7) : i > 7 ? Math.round(actual(7) + (i - 7) * 1650 + Math.sin(i) * 700) : null,
}))

export default function AreaChartStrokes() {
  return (
    <AreaChart
      aria-label="Haftalık ciro: gerçekleşen, hedef ve tahmin"
      className="w-full"
      data={weeks}
      index="week"
      variant="line"
      series={[
        { key: "actual", label: "Gerçekleşen" },
        { key: "target", label: "Hedef", strokeStyle: "dashed" },
        { key: "forecast", label: "Tahmin", strokeStyle: "animated-dashed" },
      ]}
      valueFormat={lira}
      yFormat={liraCompact}
    />
  )
}
