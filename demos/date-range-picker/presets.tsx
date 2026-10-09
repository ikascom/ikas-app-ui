"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"

import { DateRangePicker } from "@/components/ikas/date-range-picker"

export default function DateRangePickerPresets() {
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 8),
  })

  return <DateRangePicker value={range} onValueChange={setRange} />
}
