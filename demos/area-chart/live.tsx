"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { AreaChart } from "@/components/ikas/area-chart"

const WINDOW = 30
const TICK_MS = 1500

/** Deterministic start so server and client render the same first frame. */
function visitors(t: number) {
  return Math.round(140 + Math.sin(t * 0.35) * 28 + Math.sin(t * 1.3 + 2) * 12 + (t % 9 === 0 ? 18 : 0))
}

const time = (t: number) => {
  const d = new Date(2026, 9, 6, 14, 0, 0)
  d.setSeconds(d.getSeconds() + t * 2)
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(d)
}

export default function AreaChartLive() {
  const reduce = useReducedMotion()
  const [t, setT] = React.useState(WINDOW)
  const data = React.useMemo(() => Array.from({ length: WINDOW }, (_, i) => ({ time: time(t - WINDOW + i), visitors: visitors(t - WINDOW + i) })), [t])

  React.useEffect(() => {
    const tick = window.setInterval(() => {
      // Pause while the tab is hidden; resume where it left off.
      if (document.visibilityState === "visible") setT((value) => value + 1)
    }, TICK_MS)
    return () => window.clearInterval(tick)
  }, [])

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted-foreground">Anlık ziyaretçi</span>
          <AnimatedNumber value={data[data.length - 1].visitors} className="text-2xl font-semibold tracking-[-0.02em]" />
        </div>
        <Badge status="success" dot className="[&>span:first-child]:animate-pulse motion-reduce:[&>span:first-child]:animate-none">
          Canlı
        </Badge>
      </div>
      <AreaChart
        aria-label="Son 60 saniyede mağazadaki anlık ziyaretçi sayısı"
        data={data}
        index="time"
        series={[{ key: "visitors", label: "Ziyaretçi" }]}
        reveal="none"
        animateUpdates={!reduce}
        height={200}
      />
    </div>
  )
}
