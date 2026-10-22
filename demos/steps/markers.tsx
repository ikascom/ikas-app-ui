"use client"

import * as React from "react"

import { SegmentedControl } from "@/components/ikas/segmented-control"
import { StepMarkerProvider, markerWidth, type StepMarkerShape } from "@/components/ikas/step-kit"
import { Steps } from "@/components/ikas/steps"

const steps = [
  { id: "goal", label: "Hedef" },
  { id: "audience", label: "Kitle" },
  { id: "content", label: "İçerik", error: "Görsel yüklenemedi." },
  { id: "budget", label: "Bütçe" },
]

/** One StepMarkerProvider sets the marker shape for every stepper and setup list in the app. Diamond matches Launchpad. */
export default function StepsMarkers() {
  const [shape, setShape] = React.useState<StepMarkerShape>("diamond")
  // The horizontal stepper's last column holds only its marker: centre what sits below under what it draws.
  const drawn = `calc(${((steps.length - 1) / steps.length) * 100}% + ${markerWidth(shape, "default")}px)`

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <StepMarkerProvider shape={shape}>
        <div className="flex flex-col gap-8">
          <Steps steps={steps} current={2} label="Yatay" />
          <div style={{ width: drawn }}>
            <Steps orientation="compact" steps={steps} current={1} label="Kompakt" className="mx-auto w-full max-w-sm" />
          </div>
        </div>
      </StepMarkerProvider>
      <div className="flex justify-center border-t pt-5" style={{ width: drawn }}>
        <SegmentedControl
          aria-label="İşaret şekli"
          mode="radio"
          size="sm"
          value={shape}
          onValueChange={setShape}
          options={[
            { value: "diamond", label: "Elmas" },
            { value: "circle", label: "Daire" },
            { value: "square", label: "Kare" },
            { value: "pill", label: "Hap" },
          ]}
        />
      </div>
    </div>
  )
}
