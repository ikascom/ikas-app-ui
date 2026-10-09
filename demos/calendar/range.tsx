"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"

export default function CalendarRange() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 9, 6),
    to: new Date(2026, 9, 15),
  })

  return <Calendar mode="range" selected={range} onSelect={setRange} defaultMonth={new Date(2026, 9)} />
}
