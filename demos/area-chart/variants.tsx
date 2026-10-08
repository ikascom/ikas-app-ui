"use client"

import * as React from "react"

import { AreaChart, type AreaChartVariant } from "@/components/ikas/area-chart"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { liraCompact, lira, periodComparison } from "@/demos/area-chart/_data"

export default function AreaChartVariants() {
  const [variant, setVariant] = React.useState<AreaChartVariant>("gradient")

  return (
    <div className="flex w-full flex-col gap-4">
      <SegmentedControl
        size="sm"
        mode="radio"
        aria-label="Dolgu"
        value={variant}
        onValueChange={setVariant}
        options={[
          { value: "gradient", label: "Gradient" },
          { value: "hatched", label: "Taralı" },
          { value: "dotted", label: "Noktalı" },
          { value: "solid", label: "Düz" },
          { value: "line", label: "Çizgi" },
        ]}
      />
      {/* key replays the reveal so each variant enters the same way */}
      <AreaChart
        key={variant}
        aria-label="Haftalık ciro, bu dönem ve önceki dönem"
        data={periodComparison}
        index="week"
        variant={variant}
        valueFormat={lira}
        yFormat={liraCompact}
        series={[
          { key: "current", label: "Bu dönem" },
          { key: "previous", label: "Önceki dönem" },
        ]}
      />
    </div>
  )
}
