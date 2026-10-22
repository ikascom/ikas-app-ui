"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ikas/progress-bar"

/** No total yet: a bar travels the track. When the total arrives the fill starts where that bar is, not from zero. */
export default function ProgressBarIndeterminate() {
  const [total, setTotal] = React.useState<number | null>(null)
  const [moved, setMoved] = React.useState(0)

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ProgressBar
        indeterminate={total === null}
        value={moved}
        max={total ?? 100}
        label={total === null ? "Hazırlanıyor…" : "Siparişler aktarılıyor"}
        valueFormat={(v, max) => `${new Intl.NumberFormat("tr-TR").format(Math.round(v))} / ${new Intl.NumberFormat("tr-TR").format(max)}`}
        hint={total === null ? "Süre hesaplanıyor…" : "Yaklaşık 3 dakika kaldı"}
      />
      <div className="flex flex-wrap justify-center gap-2 border-t pt-5">
        <Button size="sm" variant="outline" disabled={total !== null} onClick={() => (setTotal(1000), setMoved(320))}>
          Toplam bilindi
        </Button>
        <Button size="sm" variant="outline" disabled={total === null} onClick={() => setMoved((m) => Math.min(1000, m + 170))}>
          İlerlet
        </Button>
        <Button size="sm" variant="ghost" onClick={() => (setTotal(null), setMoved(0))}>
          Baştan
        </Button>
      </div>
    </div>
  )
}
