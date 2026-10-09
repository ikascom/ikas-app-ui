"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { WheelPicker, WheelPickerGroup } from "@/components/ui/wheel-picker"

type DateWheelPickerProps = {
  /** Selected date. Leave undefined with defaultValue for an uncontrolled picker. */
  value?: Date
  /** Initial date when uncontrolled. Today (kept inside the bounds) when left out. */
  defaultValue?: Date
  /** Called with the date under the band, at midnight local time. */
  onValueChange?: (value: Date) => void
  /** Earliest selectable day. 100 years before today when left out. */
  minDate?: Date
  /** Latest selectable day. The end of next year when left out. */
  maxDate?: Date
  /** Month names in full ("Ekim") or short ("Eki"). */
  monthFormat?: "long" | "short"
  /** BCP 47 locale for the month names. */
  locale?: string
  /** Row height: sm is 32px, default is 36px. */
  size?: "sm" | "default"
  /** Rows visible through the window. Use an odd number. */
  visibleCount?: number
  /** Blocks every wheel. */
  disabled?: boolean
  /** Accessible names of the day, month and year wheels. */
  labels?: { day: string; month: string; year: string }
  /** Classes for the frame. */
  className?: string
  /** Id of the frame, for an aria-labelledby. */
  id?: string
  /** Accessible name of the whole picker. */
  "aria-label"?: string
}

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const daysIn = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)

/** Day, month and year wheels in one frame; days follow the month and bounds stay respected. */
function DateWheelPicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  monthFormat = "long",
  locale = "tr-TR",
  size = "default",
  visibleCount = 5,
  disabled = false,
  labels = { day: "Gün", month: "Ay", year: "Yıl" },
  className,
  id,
  "aria-label": ariaLabel = "Tarih",
}: DateWheelPickerProps) {
  const [today] = React.useState(() => dayStart(new Date()))
  const min = minDate ? dayStart(minDate) : new Date(today.getFullYear() - 100, 0, 1)
  const max = maxDate ? dayStart(maxDate) : new Date(today.getFullYear() + 1, 11, 31)
  const fit = (d: Date) => new Date(Math.min(Math.max(dayStart(d).getTime(), min.getTime()), max.getTime()))

  const [uncontrolled, setUncontrolled] = React.useState(() => fit(defaultValue ?? valueProp ?? today))
  const value = fit(valueProp ?? uncontrolled)
  const year = value.getFullYear()
  const month = value.getMonth()
  const day = value.getDate()

  const minY = min.getFullYear()
  const maxY = max.getFullYear()
  const firstMonth = year === minY ? min.getMonth() : 0
  const lastMonth = year === maxY ? max.getMonth() : 11
  const firstDay = year === minY && month === min.getMonth() ? min.getDate() : 1
  const lastDay = year === maxY && month === max.getMonth() ? max.getDate() : daysIn(year, month)

  const monthNames = React.useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: monthFormat })
    return range(0, 11).map((m) => format.format(new Date(2000, m, 1)))
  }, [locale, monthFormat])
  const years = React.useMemo(() => range(minY, maxY).map(String), [minY, maxY])
  const months = React.useMemo(
    () => range(firstMonth, lastMonth).map((m) => ({ value: String(m), label: monthNames[m] })),
    [firstMonth, lastMonth, monthNames]
  )
  const days = React.useMemo(() => range(firstDay, lastDay).map((d) => ({ value: String(d), label: String(d).padStart(2, "0") })), [firstDay, lastDay])

  /** Builds the date from the wheels, keeping the day inside the month (31 Mart → 30 Nisan) and the bounds. */
  function change(next: { year?: number; month?: number; day?: number }) {
    const y = next.year ?? year
    const m = next.month ?? month
    const date = fit(new Date(y, m, Math.min(next.day ?? day, daysIn(y, m))))
    if (date.getTime() === value.getTime()) return
    setUncontrolled(date)
    onValueChange?.(date)
  }

  return (
    <WheelPickerGroup
      id={id}
      aria-label={ariaLabel}
      size={size}
      visibleCount={visibleCount}
      disabled={disabled}
      className={cn("w-full sm:w-72", className)}
    >
      <WheelPicker aria-label={labels.day} options={days} value={String(day)} onValueChange={(d) => change({ day: Number(d) })} className="max-w-16" />
      <WheelPicker aria-label={labels.month} options={months} value={String(month)} onValueChange={(m) => change({ month: Number(m) })} className="flex-[1.6]" />
      <WheelPicker aria-label={labels.year} options={years} value={String(year)} onValueChange={(y) => change({ year: Number(y) })} className="max-w-20" />
    </WheelPickerGroup>
  )
}

export { DateWheelPicker, type DateWheelPickerProps }
