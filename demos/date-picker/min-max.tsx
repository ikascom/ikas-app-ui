"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { DatePicker } from "@/components/ikas/date-picker"

export default function DatePickerMinMax() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 3))

  return (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="campaign-end">Kampanya bitişi</FieldLabel>
      <DatePicker
        id="campaign-end"
        value={date}
        onValueChange={setDate}
        minDate={new Date(2026, 9, 12)}
        maxDate={new Date(2026, 11, 31)}
      />
      <FieldDescription>12 Ekim ile yıl sonu arasında bir gün seçin.</FieldDescription>
    </Field>
  )
}
