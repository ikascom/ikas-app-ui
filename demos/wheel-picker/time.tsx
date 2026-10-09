"use client"

import * as React from "react"

import { WheelPicker, WheelPickerGroup } from "@/components/ui/wheel-picker"

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"))

export default function WheelPickerTime() {
  const [hour, setHour] = React.useState("14")
  const [minute, setMinute] = React.useState("30")

  return (
    <div className="grid w-full max-w-56 gap-3 rounded-xl bg-card p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Yayın saati</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {hour}:{minute}
        </span>
      </div>
      <WheelPickerGroup aria-label="Yayın saati">
        <WheelPicker aria-label="Saat" options={hours} value={hour} onValueChange={setHour} />
        <span aria-hidden className="flex items-center font-medium text-muted-foreground">
          :
        </span>
        <WheelPicker aria-label="Dakika" options={minutes} value={minute} onValueChange={setMinute} />
      </WheelPickerGroup>
    </div>
  )
}
