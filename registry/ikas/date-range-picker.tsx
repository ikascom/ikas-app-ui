"use client"

import * as React from "react"
import { endOfMonth, format, isSameDay, startOfDay, startOfMonth, subDays, subMonths } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DateRangePreset = {
  /** Text on the preset button. */
  label: string
  /** Builds the range from today's date when the preset is picked. */
  range: (today: Date) => DateRange
}

/** Default presets: today, last 7 and 30 days, this month, last month. */
const dateRangePresets: DateRangePreset[] = [
  { label: "Bugün", range: (today) => ({ from: today, to: today }) },
  { label: "Son 7 gün", range: (today) => ({ from: subDays(today, 6), to: today }) },
  { label: "Son 30 gün", range: (today) => ({ from: subDays(today, 29), to: today }) },
  { label: "Bu ay", range: (today) => ({ from: startOfMonth(today), to: today }) },
  {
    label: "Geçen ay",
    range: (today) => {
      const month = subMonths(today, 1)
      return { from: startOfMonth(month), to: endOfMonth(month) }
    },
  },
]

type DateRangePickerProps = {
  /** Applied range. Leave undefined with defaultValue for an uncontrolled picker. */
  value?: DateRange
  /** Initial range when uncontrolled. */
  defaultValue?: DateRange
  /** Called on Apply with the new range, or undefined after Clear. */
  onValueChange?: (value: DateRange | undefined) => void
  /** Quick ranges listed beside the calendar. Pass [] to hide the list. */
  presets?: DateRangePreset[]
  /** Earliest selectable day. */
  minDate?: Date
  /** Latest selectable day. */
  maxDate?: Date
  /** Disables the trigger. */
  disabled?: boolean
  /** Trigger text while no range is applied. */
  placeholder?: string
  /** date-fns format string for each end of the range. */
  dateFormat?: string
  /** Popover alignment against the trigger. */
  align?: "start" | "center" | "end"
  /** Classes for the trigger button. */
  className?: string
  /** Id of the trigger, for a FieldLabel htmlFor. */
  id?: string
  /** Marks the trigger invalid inside a Field. */
  "aria-invalid"?: boolean
}

const wideQuery = "(min-width: 640px)"

/** Two months side by side from 640px up, one below. */
function useWide() {
  return React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(wideQuery)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia(wideQuery).matches,
    () => true
  )
}

function sameRange(a: DateRange | undefined, b: DateRange | undefined) {
  if (!a?.from || !b?.from) return false
  return isSameDay(a.from, b.from) && isSameDay(a.to ?? a.from, b.to ?? b.from)
}

/**
 * Range picker in a popover: presets on the side, two months, and Apply / Clear.
 * The value changes only on Apply; closing the popover discards the draft.
 */
function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  presets = dateRangePresets,
  minDate,
  maxDate,
  disabled = false,
  placeholder = "Tarih aralığı seçin",
  dateFormat = "dd.MM.yyyy",
  align = "start",
  className,
  id,
  "aria-invalid": ariaInvalid,
}: DateRangePickerProps) {
  const wide = useWide()
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : uncontrolled
  const [draft, setDraft] = React.useState<DateRange | undefined>(value)
  const [month, setMonth] = React.useState<Date>()

  /** First visible month, so the end of the range sits in the last month shown. */
  function monthFor(range: DateRange | undefined) {
    const end = range?.to ?? range?.from ?? new Date()
    return wide ? subMonths(end, 1) : end
  }

  function onOpenChange(next: boolean) {
    if (next) {
      setDraft(value)
      setMonth(monthFor(value))
    }
    setOpen(next)
  }

  function pickPreset(preset: DateRangePreset) {
    const range = preset.range(startOfDay(new Date()))
    setDraft(range)
    setMonth(monthFor(range))
  }

  function apply() {
    const next = draft?.from ? { from: draft.from, to: draft.to ?? draft.from } : undefined
    setUncontrolled(next)
    onValueChange?.(next)
    setOpen(false)
  }

  function clear() {
    setDraft(undefined)
    setUncontrolled(undefined)
    onValueChange?.(undefined)
  }

  const bounds = [minDate && { before: minDate }, maxDate && { after: maxDate }].filter((m) => m !== undefined)
  const label = value?.from
    ? value.to && !isSameDay(value.from, value.to)
      ? `${format(value.from, dateFormat)} – ${format(value.to, dateFormat)}`
      : format(value.from, dateFormat)
    : placeholder

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={!value?.from || undefined}
          className={cn("w-full justify-start font-normal data-empty:text-muted-foreground aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:w-auto", className)}
        >
          <CalendarIcon data-icon="inline-start" className="text-icon" />
          <span className="truncate tabular-nums">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} collisionPadding={8} className="w-auto max-w-[calc(100vw-1rem)] gap-0 p-0">
        <div className="flex flex-col sm:flex-row">
          {presets.length > 0 && (
            <div
              role="group"
              aria-label="Hazır aralıklar"
              className="flex gap-1 overflow-x-auto border-b border-border p-2 [scrollbar-width:none] sm:min-w-32 sm:shrink-0 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0"
            >
              {presets.map((preset) => {
                const active = sameRange(draft, preset.range(startOfDay(new Date())))
                return (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    aria-pressed={active}
                    onClick={() => pickPreset(preset)}
                    className="shrink-0 justify-start font-normal text-muted-foreground hover:text-foreground aria-pressed:bg-muted aria-pressed:font-medium aria-pressed:text-foreground"
                  >
                    {preset.label}
                  </Button>
                )
              })}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex justify-center p-3">
              <Calendar
                mode="range"
                selected={draft}
                onSelect={setDraft}
                month={month}
                onMonthChange={setMonth}
                numberOfMonths={wide ? 2 : 1}
                // With two months the spill-over days would repeat the range.
                showOutsideDays={!wide}
                startMonth={minDate}
                endMonth={maxDate}
                disabled={bounds}
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border p-3">
              <Button variant="ghost" size="sm" onClick={clear} disabled={!draft?.from && !value?.from}>
                Temizle
              </Button>
              <Button size="sm" onClick={apply} disabled={!draft?.from}>
                Uygula
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker, dateRangePresets, type DateRangePickerProps, type DateRangePreset }
