"use client"

import * as React from "react"
import { AlertTriangleIcon, OctagonAlertIcon } from "lucide-react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"

import { SPRING, springOrInstant } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { statusTint } from "@/lib/status"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { defaultNumberFormat } from "@/components/ikas/chart-kit"
import { SwapText } from "@/components/ikas/swap-text"

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
  /** Formats value and max in the caption. */
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

type RadialMeterBand = {
  /** Lowest value of the band, inclusive. */
  from: number
  status: MeterStatus
  /** Named under the number, e.g. "Hedefte". Status is never color alone. */
  label: string
}

type RadialMeterProps = {
  value: number
  max?: number
  label?: React.ReactNode
  /** Ring color. Usually neutral while running, success when done. Bands override it in the gauge. */
  status?: MeterStatus | "auto"
  /** Diameter in px (ring) or width in px (gauge). */
  size?: number
  strokeWidth?: number
  /** ring: a full circle with the value inside. gauge: a half circle for a score, with a band label. */
  variant?: "ring" | "gauge"
  /** Text in the middle, e.g. `(v, max) => \`${v}/${max}\`` for steps. Defaults to "%NN" (ring) or the value (gauge). */
  valueFormat?: (value: number, max: number) => string
  /** Gauge only: score bands, lowest first. The highest band reached sets the color and the label. */
  bands?: RadialMeterBand[]
  className?: string
}

/** Compact ring with the value in the middle (a single job), or a half-circle gauge for a score. */
function RadialMeter({ variant = "ring", ...props }: RadialMeterProps) {
  return variant === "gauge" ? <Gauge {...props} /> : <Ring {...props} />
}

function Ring({ value, max = 100, label, status = "neutral", size = 96, strokeWidth = 8, valueFormat, className }: Omit<RadialMeterProps, "variant" | "bands">) {
  const reduce = useReducedMotion()
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const colors = statusColors[resolveStatus(status, ratio)]
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const percent = Math.round(ratio * 100)
  const text = valueFormat?.(value, max)

  return (
    <div data-slot="radial-meter" className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={text ?? `%${percent}`}
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
            animate={{ strokeDashoffset: circumference * (1 - ratio), opacity: ratio > 0 ? 1 : 0 }}
            transition={springOrInstant(reduce)}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-base font-semibold tracking-[-0.02em] tabular-nums">
          {text !== undefined ? <SwapText direction={1}>{text}</SwapText> : <AnimatedNumber value={percent} format={(n) => `%${n}`} />}
        </span>
      </div>
      {label && <span className="text-center text-[13px] text-muted-foreground">{label}</span>}
    </div>
  )
}

const bandOf = (bands: RadialMeterBand[] | undefined, value: number) => bands?.reduce<RadialMeterBand | undefined>((hit, band) => (value >= band.from ? band : hit), undefined)

/** Half circle, opening downward. The arc is re-pathed every frame, so its round end stays exact at every value. */
function Gauge({ value, max = 100, label, status = "neutral", size = 220, strokeWidth = 12, valueFormat, bands, className }: Omit<RadialMeterProps, "variant">) {
  const reduce = useReducedMotion()
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const band = bandOf(bands, value)
  const colors = statusColors[band?.status ?? resolveStatus(status, ratio)]
  const sweep = useMotionValue(reduce ? ratio : 0)
  const [previous, setPrevious] = React.useState(value)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  if (value !== previous) {
    setDirection(value > previous ? 1 : -1)
    setPrevious(value)
  }

  React.useEffect(() => {
    if (reduce) return sweep.jump(ratio)
    const controls = animate(sweep, ratio, SPRING)
    return () => controls.stop()
  }, [ratio, reduce, sweep])

  const R = 80
  const path = useTransform(sweep, (t) => {
    const a = Math.PI * (1 - Math.max(t, 0.0001))
    return `M20 100 A${R} ${R} 0 0 1 ${(100 + R * Math.cos(a)).toFixed(2)} ${(100 - R * Math.sin(a)).toFixed(2)}`
  })
  // At 0 the round cap would show as a dot, so the arc fades in over the first 2%.
  const opacity = useTransform(sweep, (t) => Math.min(1, t / 0.02))
  const shown = valueFormat ? valueFormat(value, max) : undefined

  return (
    <figure
      data-slot="radial-meter"
      data-variant="gauge"
      className={cn("m-0 inline-flex flex-col items-center gap-1", className)}
      style={{ width: size, "--gauge-fill": colors.fill, "--gauge-track": colors.track } as React.CSSProperties}
    >
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={[shown ?? String(value), band?.label].filter(Boolean).join(", ")}
        aria-label={typeof label === "string" ? label : undefined}
        className="relative w-full"
      >
        <svg viewBox="0 -6 200 112" className="block w-full overflow-visible" aria-hidden>
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" strokeWidth={strokeWidth} strokeLinecap="round" className="stroke-(--gauge-track) transition-[stroke] duration-200 ease-out" />
          <motion.path d={path} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" style={{ opacity }} className="stroke-(--gauge-fill) transition-[stroke] duration-200 ease-out" />
        </svg>
        <div aria-hidden className="absolute inset-x-0 bottom-0.5 flex flex-col items-center gap-0.5">
          <span className="text-[30px] leading-none font-semibold tracking-[-0.02em] tabular-nums">
            {shown !== undefined ? <SwapText direction={direction}>{shown}</SwapText> : <AnimatedNumber value={value} />}
          </span>
          {band && (
            <SwapText direction={direction} className={cn("text-[12.5px] font-medium", band.status !== "neutral" && "text-(--gauge-fill)")}>
              {band.label}
            </SwapText>
          )}
        </div>
      </div>
      {label && <figcaption className="text-center text-[13px] text-muted-foreground">{label}</figcaption>}
    </figure>
  )
}

export { Meter, RadialMeter, type MeterProps, type MeterStatus, type RadialMeterBand, type RadialMeterProps }
