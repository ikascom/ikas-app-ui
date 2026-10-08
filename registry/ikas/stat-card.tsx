import * as React from "react"
import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { statusTint } from "@/lib/status"

type StatCardProps = React.ComponentProps<"div"> & {
  label: React.ReactNode
  value: React.ReactNode
  /** Change against the previous period, e.g. 12.4 for +12.4%. */
  change?: number
  /** Set when a decrease is good, e.g. refund rate or response time. */
  invertChange?: boolean
  /** Context for the change, e.g. "vs last 30 days". */
  changeLabel?: React.ReactNode
  /** Optional slot under the value, e.g. a sparkline. */
  footer?: React.ReactNode
}

function StatCard({
  className,
  label,
  value,
  change,
  invertChange = false,
  changeLabel,
  footer,
  ...props
}: StatCardProps) {
  const hasChange = typeof change === "number" && Number.isFinite(change)
  const isUp = hasChange && change > 0
  const isFlat = hasChange && change === 0
  const isGood = invertChange ? !isUp : isUp

  return (
    <div
      data-slot="stat-card"
      className={cn("flex flex-col gap-2 rounded-xl bg-card p-5 shadow-card", className)}
      {...props}
    >
      <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
      <p className="font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground tabular-nums">{value}</p>
      {hasChange && (
        <p className="flex items-center gap-1.5 text-[13px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium tabular-nums [&>svg]:size-3.5 [&>svg]:text-(--s-icon)",
              isFlat ? "text-muted-foreground" : cn(isGood ? statusTint.success : statusTint.danger, "text-(--s-text)")
            )}
          >
            {!isFlat && (isUp ? <ArrowUpRightIcon /> : <ArrowDownRightIcon />)}
            {/* Turkish percent: sign, then %, then the number (+%12,4). */}
            {isUp ? "+" : change < 0 ? "−" : ""}%{Math.abs(change).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}
          </span>
          {changeLabel && <span className="text-muted-foreground">{changeLabel}</span>}
        </p>
      )}
      {footer}
    </div>
  )
}

export { StatCard, type StatCardProps }
