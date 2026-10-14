"use client"

import * as React from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { ColorPicker } from "@/components/ikas/color-picker"

export default function ColorPickerSwatches() {
  const [color, setColor] = React.useState("#C2410C")
  const [swatches, setSwatches] = React.useState(["#C2410C", "#0F766E", "#7C3AED", "#1F2937"])

  return (
    <div className="grid w-full max-w-sm gap-4">
      <Field>
        <FieldLabel htmlFor="badge-color">Rozet rengi</FieldLabel>
        <ColorPicker
          id="badge-color"
          label="Rozet rengi"
          value={color}
          onValueChange={setColor}
          swatches={swatches}
          onSwatchesChange={setSwatches}
          contrastWith="#FFFFFF"
        />
      </Field>
      <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card">
        <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ background: color }}>
          Yeni
        </span>
        <span className="text-sm">Keten gömlek</span>
      </div>
    </div>
  )
}
