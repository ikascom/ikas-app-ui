"use client"

import * as React from "react"
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { defaultNumberFormat } from "@/components/ikas/chart-kit"
import { SegmentedControl } from "@/components/ikas/segmented-control"

type ChartCardRange<T extends string> = { value: T; label: string }

type ChartCardProps<T extends string> = {
  title: React.ReactNode
  description?: React.ReactNode
  /** The headline figure for the selected range. Rolls when it changes. */
  value?: number
  valueFormat?: (value: number) => string
  /** Percent change against the previous period, e.g. 12.4. */
  change?: number
  /** Set when a decrease is good (refunds, errors, response time). */
  invertChange?: boolean
  changeLabel?: React.ReactNode
  ranges?: ChartCardRange<T>[]
  range?: T
  onRangeChange?: (range: T) => void
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/**
 * The frame every dashboard chart sits in: title, headline value with its
 * change, a range switch and the chart. Switching the range crossfades the body.
 */
function ChartCard<T extends string>({
  title,
  description,
  value,
  valueFormat = defaultNumberFormat,
  change,
  invertChange = false,
  changeLabel,
  ranges,
  range,
  onRangeChange,
  footer,
  className,
  children,
}: ChartCardProps<T>) {
  const hasChange = typeof change === "number" && Number.isFinite(change)
  const isUp = hasChange && change > 0
  const isFlat = hasChange && change === 0
  const isGood = invertChange ? !isUp : isUp

  return (
    <section data-slot="chart-card" className={cn("flex flex-col overflow-hidden rounded-xl bg-card shadow-card", className)}>
      <header className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-[13px] font-medium text-muted-foreground">{title}</h3>
          {value != null && (
            <div className="flex flex-wrap items-center gap-2">
              <AnimatedNumber value={value} format={valueFormat} className="text-2xl font-semibold tracking-[-0.02em] text-foreground" />
              {hasChange && (
                <Badge tone={isFlat ? "neutral" : isGood ? "success" : "critical"} size="sm">
                  {!isFlat && (isUp ? <ArrowUpRightIcon /> : <ArrowDownRightIcon />)}
                  {isUp ? "+" : change < 0 ? "−" : ""}%{Math.abs(change).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}
                </Badge>
              )}
              {changeLabel && <span className="text-[12px] text-muted-foreground">{changeLabel}</span>}
            </div>
          )}
          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
        </div>
        {ranges && range != null && onRangeChange && (
          <SegmentedControl size="sm" mode="radio" aria-label="Zaman aralığı" options={ranges} value={range} onValueChange={onRangeChange} />
        )}
      </header>
      <div key={range} className="px-5 pt-4 pb-5 animate-in duration-300 ease-(--ease-out) fade-in-0 motion-reduce:animate-none">
        {children}
      </div>
      {footer && <footer className="border-t bg-muted/40 px-5 py-3 text-[13px] text-muted-foreground">{footer}</footer>}
    </section>
  )
}

export { ChartCard, type ChartCardProps, type ChartCardRange }
