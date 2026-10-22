"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { type StepMarkerShape } from "@/components/ikas/step-kit"
import { Steps, type StepsItem } from "@/components/ikas/steps"

const base: StepsItem[] = [
  { id: "goal", label: "Hedef", description: "Kampanyanın amacını seç." },
  { id: "audience", label: "Kitle", description: "Kimlere gösterileceğini belirle." },
  { id: "content", label: "İçerik", description: "Başlık ve görselleri ekle." },
  { id: "budget", label: "Bütçe", description: "Günlük harcama sınırını gir." },
  { id: "review", label: "Önizleme", description: "Yayından önce kontrol et." },
]
const shapes: { value: StepMarkerShape; label: string }[] = [
  { value: "diamond", label: "Elmas" },
  { value: "circle", label: "Daire" },
  { value: "square", label: "Kare" },
  { value: "pill", label: "Hap" },
]

/** A wizard of five steps. "Sona atla" fills the connectors one after another; the current step's halo lands last. */
export default function StepsHorizontal() {
  const [current, setCurrent] = React.useState(1)
  const [failed, setFailed] = React.useState(false)
  const [shape, setShape] = React.useState<StepMarkerShape>("diamond")
  const go = (to: number) => (setFailed(false), setCurrent(Math.max(0, Math.min(base.length, to))))
  const steps = base.map((step, i) => (failed && i === current ? { ...step, error: "Kaydedilemedi, tekrar dene." } : step))

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <Steps steps={steps} current={current} marker={shape} label="Kampanya adımları" />
      <div className="flex flex-col items-center gap-3 border-t pt-5">
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => go(current - 1)}>Geri</Button>
          <Button size="sm" onClick={() => go(current + 1)}>İleri</Button>
          <Button size="sm" variant="outline" onClick={() => go(base.length)}>Sona atla</Button>
          <Button size="sm" variant="outline" onClick={() => go(0)}>Başa dön</Button>
          <Button size="sm" variant="outline" disabled={current >= base.length} onClick={() => setFailed(true)}>Hata</Button>
        </div>
        <SegmentedControl aria-label="İşaret şekli" mode="radio" size="sm" value={shape} onValueChange={setShape} options={shapes} />
      </div>
    </div>
  )
}
