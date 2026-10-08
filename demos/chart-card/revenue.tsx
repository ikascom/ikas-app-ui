"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ChartCard } from "@/components/ikas/chart-card"
import { ChartFillDefs, ChartTooltipCard, RevealMask, chartFill, compactNumberFormat } from "@/components/ikas/chart-kit"

type Range = "7" | "30" | "90"

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format
const day = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format

/** Deterministic, gently rising revenue so ranges look like the same store. */
function revenue(days: number) {
  const end = new Date(2026, 9, 6)
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - 1 - i))
    const trend = 4200 + i * (5200 / days)
    const wave = Math.sin(i * 0.9) * 900 + Math.cos(i * 0.37) * 650
    const weekend = date.getDay() % 6 === 0 ? 1400 : 0
    return { date: day(date), revenue: Math.round(trend + wave + weekend) }
  })
}

const data: Record<Range, ReturnType<typeof revenue>> = { "7": revenue(7), "30": revenue(30), "90": revenue(90) }
const changes: Record<Range, number> = { "7": 8.4, "30": 12.4, "90": 31.2 }

export default function ChartCardRevenue() {
  const [range, setRange] = React.useState<Range>("30")
  const rows = data[range]
  const total = rows.reduce((sum, r) => sum + r.revenue, 0)
  const id = React.useId().replace(/:/g, "")

  return (
    <ChartCard
      className="w-full"
      title="Gelir"
      value={total}
      valueFormat={money}
      change={changes[range]}
      changeLabel="önceki döneme göre"
      ranges={[
        { value: "7", label: "7G" },
        { value: "30", label: "30G" },
        { value: "90", label: "90G" },
      ]}
      range={range}
      onRangeChange={setRange}
      footer="Kargo ve vergiler hariç. Veriler her saat güncellenir."
    >
      <ChartContainer config={{ revenue: { label: "Gelir", color: "var(--chart-ink)" } }} className="aspect-auto h-56 w-full">
        <AreaChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <ChartFillDefs id={`${id}-fill`} color="var(--chart-ink)" variant="gradient" />
            <RevealMask id={`${id}-reveal`} />
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
          <YAxis width={44} tickLine={false} axisLine={false} tickFormatter={compactNumberFormat} />
          <ChartTooltip
            cursor={{ stroke: "var(--border-strong)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipCard title={label} format={money} rows={[{ key: "revenue", label: "Gelir", color: "var(--chart-ink)", value: payload[0].value as number }]} />
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--chart-ink)"
            strokeWidth={2}
            fill={chartFill(`${id}-fill`, "var(--chart-ink)", "gradient")}
            isAnimationActive={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            style={{ mask: `url(#${id}-reveal)` }}
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  )
}
