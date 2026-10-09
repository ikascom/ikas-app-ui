"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DatePickerProps = {
  /** Selected date. Leave undefined with defaultValue for an uncontrolled picker. */
  value?: Date
  /** Initial date when uncontrolled. */
  defaultValue?: Date
  /** Called with the picked date, or undefined when the selection is cleared. */
  onValueChange?: (value: Date | undefined) => void
  /** Earliest selectable day; earlier days are disabled. */
  minDate?: Date
  /** Latest selectable day; later days are disabled. */
  maxDate?: Date
  /** Disables the trigger. */
  disabled?: boolean
  /** Trigger text while no date is selected. */
  placeholder?: string
  /** date-fns format string for the trigger. */
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

/** Outline button that opens a calendar in a popover and shows the picked date. */
function DatePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder = "Tarih seçin",
  dateFormat = "dd.MM.yyyy",
  align = "start",
  className,
  id,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const value = valueProp !== undefined ? valueProp : uncontrolled

  function select(date: Date | undefined) {
    setUncontrolled(date)
    onValueChange?.(date)
    setOpen(false)
  }

  const bounds = [minDate && { before: minDate }, maxDate && { after: maxDate }].filter((m) => m !== undefined)
  // Open on the selected month, else today's month kept inside the bounds.
  const today = new Date()
  const month = value ?? (maxDate && today > maxDate ? maxDate : minDate && today < minDate ? minDate : undefined)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={!value || undefined}
          className={cn("w-full justify-start font-normal data-empty:text-muted-foreground aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:w-48", className)}
        >
          <CalendarIcon data-icon="inline-start" className="text-icon" />
          <span className="truncate tabular-nums">{value ? format(value, dateFormat) : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} collisionPadding={8} className="w-auto p-3">
        <Calendar
          mode="single"
          selected={value}
          onSelect={select}
          defaultMonth={month}
          startMonth={minDate}
          endMonth={maxDate}
          disabled={bounds}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, type DatePickerProps }
