"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { ProgressBar, type ProgressSegmentType } from "@/components/ikas/progress-bar"
import { SegmentedControl } from "@/components/ikas/segmented-control"

const types: { value: ProgressSegmentType; label: string }[] = [
  { value: "skew", label: "Eğik" },
  { value: "block", label: "Blok" },
  { value: "pill", label: "Hap" },
  { value: "notch", label: "Çentikli" },
  { value: "dot", label: "Nokta" },
  { value: "diamond", label: "Elmas" },
]
const names = ["Hedef", "Kitle", "İçerik", "Bütçe", "Önizleme"]

/** A few equal steps. Jumping fills the segments one after another; going back drains them from the far end. */
export default function ProgressBarSegments() {
  const [done, setDone] = React.useState(2)
  const [type, setType] = React.useState<ProgressSegmentType>("skew")
  const [failed, setFailed] = React.useState(false)
  const go = (to: number) => (setFailed(false), setDone(Math.max(0, Math.min(5, to))))

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ProgressBar
        variant="segments"
        segmentType={type}
        value={done}
        max={5}
        label="Kampanya kurulumu"
        status={failed ? "danger" : "auto"}
        hint={failed ? `${names[done]} adımı kaydedilemedi` : done >= 5 ? "Kampanya yayında" : `Sıradaki: ${names[done]}`}
      />
      <div className="flex flex-col items-center gap-3 border-t pt-5">
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => go(done + 1)}>İleri</Button>
          <Button size="sm" variant="outline" onClick={() => go(done - 1)}>Geri</Button>
          <Button size="sm" variant="outline" onClick={() => go(done + 3)}>3 adım atla</Button>
          <Button size="sm" variant="outline" disabled={done >= 5} onClick={() => setFailed(true)}>Hata</Button>
        </div>
        <SegmentedControl aria-label="Segment tipi" mode="radio" size="sm" value={type} onValueChange={setType} options={types} />
      </div>
    </div>
  )
}
