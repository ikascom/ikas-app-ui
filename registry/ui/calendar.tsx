"use client"

import * as React from "react"
import type { Locale } from "date-fns"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"
import { tr } from "react-day-picker/locale"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

type DayPickerProps = React.ComponentProps<typeof DayPicker>

/** Every react-day-picker prop works; these are the ones with ikas defaults. */
type CalendarProps = DayPickerProps & {
  /** Language of month and weekday names, a react-day-picker or date-fns locale. */
  locale?: Partial<Locale>
  /** First day of the week, 0 for Sunday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** "dropdown" adds month and year selects; limit them with startMonth and endMonth. */
  captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years"
  /** Fills the grid with the days of the previous and next month. */
  showOutsideDays?: boolean
}

/**
 * Month grid on react-day-picker for single, range and multiple selection.
 * Turkish and Monday-first by default; pass `locale` and `weekStartsOn` to change.
 * Set `captionLayout="dropdown"` for month and year selects.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  locale = tr,
  weekStartsOn = 1,
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      locale={locale}
      weekStartsOn={weekStartsOn}
      className={cn(
        "group/calendar w-fit rounded-xl bg-card p-3 text-card-foreground shadow-card [--cell-size:--spacing(9)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=card-content]_&]:shadow-none [[data-slot=popover-content]_&]:rounded-none [[data-slot=popover-content]_&]:bg-transparent [[data-slot=popover-content]_&]:p-0 [[data-slot=popover-content]_&]:shadow-none",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 sm:flex-row sm:gap-6", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-3", defaultClassNames.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1", defaultClassNames.nav),
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "z-10 size-(--cell-size) text-muted-foreground hover:text-foreground aria-disabled:opacity-40",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "z-10 size-(--cell-size) text-muted-foreground hover:text-foreground aria-disabled:opacity-40",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn("flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium", defaultClassNames.dropdowns),
        dropdown_root: cn(
          "relative rounded-md bg-card shadow-raised transition-shadow hover:shadow-raised-hover has-focus-visible:ring-3 has-focus-visible:ring-ring/30",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("absolute inset-0 cursor-pointer bg-popover opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "font-medium capitalize select-none",
          captionLayout === "label"
            ? "text-sm"
            : "flex h-7 items-center gap-1 rounded-md pr-1.5 pl-2.5 text-[13px] [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
          defaultClassNames.caption_label
        ),
        month_grid: cn("w-full border-collapse", defaultClassNames.month_grid),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "w-(--cell-size) flex-1 text-xs font-medium text-muted-foreground capitalize select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-1 flex w-full", defaultClassNames.week),
        week_number_header: cn("w-(--cell-size) select-none", defaultClassNames.week_number_header),
        week_number: cn("text-xs text-muted-foreground select-none", defaultClassNames.week_number),
        day: cn(
          "group/day relative aspect-square h-full w-full p-0 text-center select-none",
          defaultClassNames.day
        ),
        // The band behind a range sits on the cell, so the selected ends stay round.
        range_start: cn("rounded-l-md bg-muted", defaultClassNames.range_start),
        range_middle: cn("rounded-none bg-muted", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-muted", defaultClassNames.range_end),
        today: cn(defaultClassNames.today),
        outside: cn("text-muted-foreground/70", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-40", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          if (orientation === "right") return <ChevronRightIcon className={cn("size-4", className)} {...props} />
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex size-(--cell-size) items-center justify-center text-center">{children}</div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  )
}

/** One day in the grid. Exported so apps can wrap it, e.g. to add prices or dots. */
function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const end = modifiers.range_start || modifiers.range_end
  const single = modifiers.selected && !end && !modifiers.range_middle

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={single || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      data-today={modifiers.today || undefined}
      className={cn(
        "relative flex aspect-square size-auto w-full min-w-(--cell-size) items-center justify-center rounded-md text-sm leading-none tabular-nums transition-[color,background-color,box-shadow] duration-150 ease-out outline-none",
        "hover:bg-muted focus-visible:z-10 focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none",
        // Today: semibold with a dot under the number.
        "data-today:font-semibold data-today:after:absolute data-today:after:bottom-1 data-today:after:left-1/2 data-today:after:size-1 data-today:after:-translate-x-1/2 data-today:after:rounded-full data-today:after:bg-primary",
        // Range middle: carried by the cell's band, the button stays flat.
        "data-range-middle:rounded-none data-range-middle:bg-transparent data-range-middle:hover:bg-foreground/[0.06]",
        // Selected day and range ends: filled like a solid button.
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:bg-linear-to-b data-[selected-single=true]:from-white/14 data-[selected-single=true]:to-transparent data-[selected-single=true]:font-medium data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:shadow-raised data-[selected-single=true]:after:bg-primary-foreground",
        "data-range-start:bg-primary data-range-start:bg-linear-to-b data-range-start:from-white/14 data-range-start:to-transparent data-range-start:font-medium data-range-start:text-primary-foreground data-range-start:shadow-raised data-range-start:after:bg-primary-foreground",
        "data-range-end:bg-primary data-range-end:bg-linear-to-b data-range-end:from-white/14 data-range-end:to-transparent data-range-end:font-medium data-range-end:text-primary-foreground data-range-end:shadow-raised data-range-end:after:bg-primary-foreground",
        defaultClassNames.day_button,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton, type CalendarProps }
