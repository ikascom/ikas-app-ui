"use client"

import * as React from "react"
import { PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const curves = [
  { name: "--ease-out", token: "EASE_OUT", use: "Giren ve çıkan her şey", value: "var(--ease-out)", duration: 360 },
  { name: "--ease-in-out", token: "EASE_IN_OUT", use: "Ekranda yer değiştiren öğe", value: "var(--ease-in-out)", duration: 420 },
  { name: "--ease-reveal", token: "EASE_REVEAL", use: "Dialog ve popover açılışı", value: "var(--ease-reveal)", duration: 360 },
  { name: "--ease-drawer", token: "EASE_DRAWER", use: "Sheet ve çekmece", value: "var(--ease-drawer)", duration: 360 },
  { name: "--ease-spring", token: "ICON_SPRING", use: "Yalnızca ikonlar, hafif taşma", value: "var(--ease-spring)", duration: 450 },
]

/** Plays every curve side by side so the difference is felt, not described. */
export function EasingPlayground() {
  const [on, setOn] = React.useState(false)

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Aynı mesafe, farklı eğri.</p>
        <Button size="sm" variant="outline" onClick={() => setOn((value) => !value)}>
          <PlayIcon data-icon="inline-start" data-anim="nudge" />
          Oynat
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {curves.map((curve) => (
          <div key={curve.name} className="grid grid-cols-[160px_1fr] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-1.5">
            <div className="flex flex-col">
              <code className="font-mono text-[12px] font-medium">{curve.name}</code>
              <span className="text-[12px] text-muted-foreground">{curve.use}</span>
            </div>
            <div className="relative h-7 rounded-md bg-muted shadow-inset">
              <span
                className="absolute top-1 size-5 rounded-[5px] bg-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.2)] motion-reduce:transition-none"
                style={{ left: on ? "calc(100% - 1.5rem)" : "0.25rem", transition: `left ${curve.duration}ms ${curve.value}` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
