"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function CalendarSingle() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 9, 14))

  return <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={new Date(2026, 9)} />
}
