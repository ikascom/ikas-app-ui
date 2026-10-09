"use client"

import * as React from "react"

import { DateWheelPicker } from "@/components/ikas/date-wheel-picker"

const long = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" })

export default function DateWheelPickerSimple() {
  const [date, setDate] = React.useState(new Date(2026, 9, 12))

  return (
    <div className="grid w-full max-w-xs gap-3 rounded-xl bg-card p-4 shadow-card">
      <div className="grid gap-0.5">
        <span className="text-sm font-medium">Teslimat tarihi</span>
        <span className="text-sm text-muted-foreground">{long.format(date)}</span>
      </div>
      <DateWheelPicker value={date} onValueChange={setDate} className="sm:w-full" />
    </div>
  )
}
