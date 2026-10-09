"use client"

import * as React from "react"

import { DatePicker } from "@/components/ikas/date-picker"

export default function DatePickerSimple() {
  const [date, setDate] = React.useState<Date>()

  return <DatePicker value={date} onValueChange={setDate} />
}
