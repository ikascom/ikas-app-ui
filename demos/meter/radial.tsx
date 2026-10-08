"use client"

import * as React from "react"
import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadialMeter } from "@/components/ikas/meter"

export default function MeterRadial() {
  const [synced, setSynced] = React.useState(72)

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-end justify-center gap-10">
        <RadialMeter value={synced} label={synced >= 100 ? "Senkronizasyon tamamlandı" : "Ürünler senkronize ediliyor"} status={synced >= 100 ? "success" : "neutral"} size={112} />
        <RadialMeter value={38} label="Görsel optimizasyonu" size={80} strokeWidth={6} />
        <RadialMeter value={94} label="Depolama" status="auto" size={80} strokeWidth={6} />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setSynced((v) => Math.max(0, v - 15))}>
          <RotateCcwIcon data-icon="inline-start" data-anim="spin" />
          Geri al
        </Button>
        <Button size="sm" onClick={() => setSynced((v) => Math.min(100, v + 12))}>
          İlerlet
        </Button>
      </div>
    </div>
  )
}
