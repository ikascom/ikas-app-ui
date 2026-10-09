"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { WheelPicker } from "@/components/ui/wheel-picker"

const days = Array.from({ length: 14 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} gün` }))

export default function WheelPickerBasic() {
  const [value, setValue] = React.useState("3")

  return (
    <Field className="max-w-48">
      <FieldLabel id="prep-time-label">Hazırlık süresi</FieldLabel>
      <WheelPicker aria-labelledby="prep-time-label" options={days} value={value} onValueChange={setValue} />
      <FieldDescription>Sipariş {value} iş günü içinde kargoya verilir.</FieldDescription>
    </Field>
  )
}
