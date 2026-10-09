"use client"

import * as React from "react"
import { addDays } from "date-fns"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DateRangePicker, type DateRangePreset } from "@/components/ikas/date-range-picker"

const nextSaturday = (today: Date) => addDays(today, (6 - today.getDay() + 7) % 7)

/** Campaign window: future dates only, presets that count forward from today. */
const presets: DateRangePreset[] = [
  { label: "Hafta sonu", range: (today) => ({ from: nextSaturday(today), to: addDays(nextSaturday(today), 1) }) },
  { label: "Önümüzdeki 7 gün", range: (today) => ({ from: today, to: addDays(today, 6) }) },
  { label: "Önümüzdeki 30 gün", range: (today) => ({ from: today, to: addDays(today, 29) }) },
]

export default function DateRangePickerForm() {
  const [range, setRange] = React.useState<DateRange>()

  return (
    <form className="w-full max-w-sm" onSubmit={(event) => event.preventDefault()}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="campaign-title">Kampanya adı</FieldLabel>
          <Input id="campaign-title" defaultValue="Kış indirimi" />
        </Field>
        <Field>
          <FieldLabel htmlFor="campaign-dates">Geçerlilik tarihleri</FieldLabel>
          <DateRangePicker
            id="campaign-dates"
            className="sm:w-full"
            value={range}
            onValueChange={setRange}
            presets={presets}
            minDate={new Date(2026, 9, 9)}
          />
          <FieldDescription>Kampanya bu tarihler arasında mağazada görünür.</FieldDescription>
        </Field>
        <Button type="submit" className="self-start" disabled={!range?.from}>
          Kaydet
        </Button>
      </FieldGroup>
    </form>
  )
}
