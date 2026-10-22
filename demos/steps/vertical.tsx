"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { type StepMarkerShape } from "@/components/ikas/step-kit"
import { Steps, type StepsItem } from "@/components/ikas/steps"

const base: StepsItem[] = [
  { id: "connect", label: "Hesabı bağla", description: "Pazaryeri API anahtarını gir." },
  { id: "products", label: "Ürünleri seç", description: "Gönderilecek ürünleri filtrele." },
  { id: "price", label: "Fiyat kuralı", description: "Komisyonu fiyata yansıt." },
  { id: "preview", label: "Önizle", description: "İlk 10 ürünü kontrol et." },
  { id: "publish", label: "Yayınla", description: "Ürünleri pazaryerine gönder." },
]
const shapes: { value: StepMarkerShape; label: string }[] = [
  { value: "diamond", label: "Elmas" },
  { value: "circle", label: "Daire" },
  { value: "square", label: "Kare" },
  { value: "pill", label: "Hap" },
]

/** A long flow: the current step opens with its description and action; an error replaces the description. */
export default function StepsVertical() {
  const [current, setCurrent] = React.useState(1)
  const [failed, setFailed] = React.useState(false)
  const [shape, setShape] = React.useState<StepMarkerShape>("diamond")
  const steps = base.map((step, i) => (failed && i === current ? { ...step, error: "Anahtar reddedildi. Pazaryeri panelinden yeni bir anahtar al." } : step))

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Steps
        orientation="vertical"
        steps={steps}
        current={current}
        marker={shape}
        label="Pazaryeri bağlantısı"
        actions={
          current < base.length && (
            <Button size="sm" onClick={() => (setFailed(false), setCurrent(current + 1))}>
              {failed ? "Tekrar dene" : current === base.length - 1 ? "Yayınla" : "Devam et"}
            </Button>
          )
        }
      />
      <div className="flex flex-col items-center gap-3 border-t pt-5">
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="outline" onClick={() => (setFailed(false), setCurrent(Math.max(0, current - 1)))}>Geri</Button>
          <Button size="sm" variant="outline" disabled={current >= base.length} onClick={() => setFailed(true)}>Hata</Button>
          <Button size="sm" variant="ghost" onClick={() => (setFailed(false), setCurrent(0))}>Baştan</Button>
        </div>
        <SegmentedControl aria-label="İşaret şekli" mode="radio" size="sm" value={shape} onValueChange={setShape} options={shapes} />
      </div>
    </div>
  )
}
