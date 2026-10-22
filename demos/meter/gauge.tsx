"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { RadialMeter, type RadialMeterBand } from "@/components/ikas/meter"

const bands: RadialMeterBand[] = [
  { from: 0, status: "danger", label: "Düşük" },
  { from: 40, status: "warning", label: "Gelişiyor" },
  { from: 75, status: "success", label: "Hedefte" },
]

/** A score, not progress: the gauge's color and label follow its band, and the number never shows color alone. */
export default function MeterGauge() {
  const [score, setScore] = React.useState(68)

  return (
    <div className="flex flex-col items-center gap-5">
      <RadialMeter variant="gauge" value={score} bands={bands} label="Mağaza hazırlık puanı" />
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setScore((s) => Math.max(0, s - 15))}>−15</Button>
        <Button size="sm" variant="outline" onClick={() => setScore((s) => Math.min(100, s + 15))}>+15</Button>
      </div>
    </div>
  )
}
