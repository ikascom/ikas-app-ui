"use client"

import * as React from "react"

import { ChartCard } from "@/components/ikas/chart-card"
import { DonutChart } from "@/components/ikas/donut-chart"
import { channels } from "@/demos/_data"

type Range = "month" | "quarter"

const data: Record<Range, { key: string; label: string; value: number }[]> = {
  month: [
    { key: "web", label: channels.web, value: 412 },
    { key: "marketplaceA", label: channels.marketplaceA, value: 296 },
    { key: "marketplaceB", label: channels.marketplaceB, value: 158 },
    { key: "social", label: channels.social, value: 87 },
  ],
  quarter: [
    { key: "web", label: channels.web, value: 1184 },
    { key: "marketplaceA", label: channels.marketplaceA, value: 1042 },
    { key: "marketplaceB", label: channels.marketplaceB, value: 391 },
    { key: "social", label: channels.social, value: 312 },
  ],
}

export default function ChartCardDonut() {
  const [range, setRange] = React.useState<Range>("month")
  const total = data[range].reduce((sum, d) => sum + d.value, 0)

  return (
    <ChartCard
      className="w-full max-w-xl"
      title="Kanal bazında sipariş"
      value={total}
      change={range === "month" ? -3.1 : 9.6}
      ranges={[
        { value: "month", label: "Bu ay" },
        { value: "quarter", label: "Çeyrek" },
      ]}
      range={range}
      onRangeChange={setRange}
    >
      <DonutChart height={170} centerLabel="Sipariş" data={data[range]} />
    </ChartCard>
  )
}
