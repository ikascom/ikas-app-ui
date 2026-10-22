"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SegmentedControl } from "@/components/ikas/segmented-control"
import { type StepMarkerShape } from "@/components/ikas/step-kit"
import { Steps } from "@/components/ikas/steps"

const steps = ["Hedef", "Kitle", "İçerik", "Bütçe", "Önizleme"].map((label) => ({ id: label, label }))
const shapes: { value: StepMarkerShape; label: string }[] = [
  { value: "diamond", label: "Elmas" },
  { value: "circle", label: "Daire" },
  { value: "square", label: "Kare" },
  { value: "pill", label: "Hap" },
]

/** A wizard's header when there is no room for step names: markers only, the current name beside the count. */
export default function StepsCompact() {
  const [current, setCurrent] = React.useState(2)
  const [shape, setShape] = React.useState<StepMarkerShape>("diamond")

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Kampanya oluştur</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Steps orientation="compact" steps={steps} current={current} marker={shape} label="Kampanya sihirbazı" />
          <div className="flex justify-between gap-2">
            <Button size="sm" variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>Geri</Button>
            <Button size="sm" disabled={current >= steps.length} onClick={() => setCurrent(current + 1)}>
              {current >= steps.length - 1 ? "Yayınla" : "İleri"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center border-t pt-5">
        <SegmentedControl aria-label="İşaret şekli" mode="radio" size="sm" value={shape} onValueChange={setShape} options={shapes} />
      </div>
    </div>
  )
}
