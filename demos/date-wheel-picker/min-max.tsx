"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { DateWheelPicker } from "@/components/ikas/date-wheel-picker"

export default function DateWheelPickerMinMax() {
  const [date, setDate] = React.useState(new Date(2026, 10, 3))

  return (
    <Field className="max-w-xs">
      <FieldLabel id="campaign-end-label">Kampanya bitişi</FieldLabel>
      <DateWheelPicker
        aria-label="Kampanya bitişi"
        value={date}
        onValueChange={setDate}
        minDate={new Date(2026, 9, 12)}
        maxDate={new Date(2026, 11, 31)}
        monthFormat="short"
        size="sm"
      />
      <FieldDescription>12 Ekim ile yıl sonu arasında bir gün seçin.</FieldDescription>
    </Field>
  )
}
