"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const tiles = [
  { label: "Görüntülenme", value: "18.365" },
  { label: "Açılma oranı", value: "%21,7" },
  { label: "Sepete ekleme", value: "663" },
  { label: "Gelir", value: "₺48.920" },
]

export default function IconMotionStagger() {
  const [run, setRun] = React.useState(0)

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div key={run} className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile, i) => (
          <div key={tile.label} style={{ "--stagger": i } as React.CSSProperties} className="flex flex-col gap-1 rounded-lg bg-card p-4 shadow-card animate-panel-enter">
            <span className="text-[13px] text-muted-foreground">{tile.label}</span>
            <span className="text-xl font-semibold tracking-[-0.02em] tabular-nums">{tile.value}</span>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={() => setRun((n) => n + 1)}>
        <RotateCcwIcon data-anim="spin" data-icon="inline-start" />
        Tekrar oynat
      </Button>
    </div>
  )
}
