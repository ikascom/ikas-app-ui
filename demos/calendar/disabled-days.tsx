"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

/** Delivery day picker: weekends and past days are off, months and years from dropdowns. */
export default function CalendarDisabledDays() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 9, 21))

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      captionLayout="dropdown"
      defaultMonth={new Date(2026, 9)}
      startMonth={new Date(2026, 0)}
      endMonth={new Date(2027, 11)}
      disabled={[{ before: new Date(2026, 9, 12) }, { dayOfWeek: [0, 6] }]}
    />
  )
}
