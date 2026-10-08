"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { SPRING } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { defaultNumberFormat } from "@/components/ikas/chart-kit"

type BarListItem = {
  name: string
  value: number
  /** Optional leading icon, 16px. */
  icon?: React.ReactNode
  /** Turns the row into a link. */
  href?: string
}

type BarListProps = {
  data: BarListItem[]
  /** Bar color. Ink by default; the bar is drawn as a light wash of it. */
  color?: string
  /** Formats the value column. */
  valueFormat?: (value: number) => string
  /** Sorts rows by value. Ranked lists read top-down. */
  sortOrder?: "descending" | "ascending" | "none"
  /** Small column headers above the list. */
  header?: { name: React.ReactNode; value: React.ReactNode }
  className?: string
  /** Accessible summary of what the list shows. */
  "aria-label"?: string
}

/**
 * Ranked horizontal list: label on a light wash bar, value on the right.
 * Bars slide in once on mount with a short stagger.
 */
function BarList({ data, color = "var(--chart-ink)", valueFormat = defaultNumberFormat, sortOrder = "descending", header, className, "aria-label": ariaLabel }: BarListProps) {
  const reduce = useReducedMotion()
  const rows = React.useMemo(() => {
    if (sortOrder === "none") return data
    return [...data].sort((a, b) => (sortOrder === "descending" ? b.value - a.value : a.value - b.value))
  }, [data, sortOrder])
  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {header && (
        <div className="flex items-center justify-between px-1 pb-1 text-xs font-medium text-muted-foreground">
          <span>{header.name}</span>
          <span>{header.value}</span>
        </div>
      )}
      <ul aria-label={ariaLabel} className="flex flex-col gap-1">
        {rows.map((row, i) => {
          const Row = row.href ? "a" : "div"
          return (
            <li key={row.name}>
              <Row
                {...(row.href ? { href: row.href } : {})}
                className="group/row flex items-center gap-4 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <div className="relative flex h-8 min-w-0 flex-1 items-center">
                  <motion.div
                    aria-hidden
                    className="absolute inset-y-0 left-0 rounded-[5px] transition-[background-color] duration-150 group-hover/row:[--wash:20%]"
                    style={{ background: `color-mix(in oklab, ${color} var(--wash, 12%), transparent)` }}
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
                    transition={{ ...SPRING, delay: reduce ? 0 : i * 0.05 }}
                  />
                  <span className="relative flex min-w-0 items-center gap-2 px-2.5 text-sm text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-icon">
                    {row.icon}
                    <span className={cn("truncate", row.href && "underline-offset-4 group-hover/row:underline")}>{row.name}</span>
                  </span>
                </div>
                <span className="shrink-0 text-sm font-medium text-foreground tabular-nums">{valueFormat(row.value)}</span>
              </Row>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { BarList, type BarListItem, type BarListProps }
