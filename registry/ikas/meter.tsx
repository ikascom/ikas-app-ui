"use client"

import * as React from "react"
import { AlertTriangleIcon, OctagonAlertIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { springOrInstant } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { statusTint } from "@/lib/status"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { defaultNumberFormat } from "@/components/ikas/chart-kit"

type MeterStatus = "neutral" | "success" | "warning" | "danger"

/** Fill + track from the same ramp, so the state reads across the whole bar. */
const track = (fill: string, amount: number) => `color-mix(in oklab, ${fill} ${amount}%, var(--card))`
const statusColors: Record<MeterStatus, { fill: string; track: string }> = {
  neutral: { fill: "var(--chart-ink)", track: track("var(--chart-ink)", 9) },
  success: { fill: "var(--success)", track: track("var(--success)", 16) },
  warning: { fill: "var(--warning)", track: track("var(--warning)", 22) },
  danger: { fill: "var(--danger)", track: track("var(--danger)", 16) },
}

/** Status is never color alone: warning and danger carry an icon and words. Icon and text use the Banner tint. */
const statusNote: Partial<Record<MeterStatus, { icon: React.ElementType; label: string; className: string }>> = {
  warning: { icon: AlertTriangleIcon, label: "Limite yaklaşıyor", className: statusTint.warning },
  danger: { icon: OctagonAlertIcon, label: "Limit doldu", className: statusTint.danger },
}

/** auto: ≥ 90% danger, ≥ 75% warning, otherwise neutral. */
function resolveStatus(status: MeterStatus | "auto", ratio: number): MeterStatus {
  if (status !== "auto") return status
  if (ratio >= 0.9) return "danger"
  if (ratio >= 0.75) return "warning"
  return "neutral"
}

type MeterProps = {
  value: number
  max: number
  label: React.ReactNode
  /** neutral, success, warning or danger. `auto` picks from the ratio: 75% warning, 90% danger. */
  status?: MeterStatus | "auto"
  valueFormat?: (value: number) => string
  size?: "sm" | "default"
  className?: string
}

/** Usage against a limit: plan quotas, API calls, storage. */
function Meter({ value, max, label, status = "auto", valueFormat = defaultNumberFormat, size = "default", className }: MeterProps) {
  const reduce = useReducedMotion()
  const ratio = max > 0 ? Math.min(value / max, 1) : 0
  const resolved = resolveStatus(status, ratio)
  const colors = statusColors[resolved]
  const note = statusNote[resolved]
  const labelId = React.useId()

  return (
    <div data-slot="meter" data-status={resolved} className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span id={labelId} className="font-medium text-foreground">
          {label}
        </span>
        <span className="text-muted-foreground tabular-nums">
          <AnimatedNumber value={value} format={valueFormat} className="font-medium text-foreground" /> / {valueFormat(max)}
        </span>
      </div>
      <div
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${valueFormat(value)} / ${valueFormat(max)}`}
        className={cn("overflow-hidden rounded-full", size === "sm" ? "h-1.5" : "h-2")}
        style={{ background: colors.track }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: colors.fill }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={springOrInstant(reduce)}
        />
      </div>
      {note && (
        <span className={cn("flex items-center gap-1.5 text-[12px] font-medium text-(--s-text)", note.className)}>
          <note.icon className="size-3.5 text-(--s-icon)" aria-hidden />
          {note.label}
        </span>
      )}
    </div>
  )
}

type RadialMeterProps = {
  value: number
  max?: number
  label?: React.ReactNode
  /** Ring color. Usually neutral while running, success when done. */
  status?: MeterStatus | "auto"
  /** Diameter in px. */
  size?: number
  strokeWidth?: number
  className?: string
}

/** Compact ring with the percentage in the middle. Progress of a single job. */
function RadialMeter({ value, max = 100, label, status = "neutral", size = 96, strokeWidth = 8, className }: RadialMeterProps) {
  const reduce = useReducedMotion()
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const colors = statusColors[resolveStatus(status, ratio)]
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const percent = Math.round(ratio * 100)

  return (
    <div data-slot="radial-meter" className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`%${percent}`}
        aria-label={typeof label === "string" ? label : undefined}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.track} strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={colors.fill}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={reduce ? false : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - ratio) }}
            transition={springOrInstant(reduce)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-semibold tracking-[-0.02em]">
          <AnimatedNumber value={percent} format={(n) => `%${n}`} />
        </span>
      </div>
      {label && <span className="text-center text-[13px] text-muted-foreground">{label}</span>}
    </div>
  )
}

export { Meter, RadialMeter, type MeterProps, type MeterStatus, type RadialMeterProps }
