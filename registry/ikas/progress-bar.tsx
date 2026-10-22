"use client"

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react"

import { EASE_OUT, ICON_SPRING, INSTANT, SPRING } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { SwapText } from "@/components/ikas/swap-text"
import { CheckGlyph, useStepTravel } from "@/components/ikas/step-kit"

type ProgressBarStatus = "neutral" | "success" | "warning" | "danger"
type ProgressSegmentType = "skew" | "block" | "pill" | "notch" | "dot" | "diamond"

/** Fill and track from one ramp, like Meter, so the state reads across the whole bar. */
const tone: Record<ProgressBarStatus, string> = {
  neutral: "[--fill:var(--chart-ink)] [--track:color-mix(in_oklab,var(--chart-ink)_9%,var(--card))]",
  success: "[--fill:var(--success)] [--track:color-mix(in_oklab,var(--success)_16%,var(--card))]",
  warning: "[--fill:var(--warning)] [--track:color-mix(in_oklab,var(--warning)_22%,var(--card))]",
  danger: "[--fill:var(--danger)] [--track:color-mix(in_oklab,var(--danger)_16%,var(--card))]",
}

type ProgressBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Work done so far. Clamped to 0…max. In the segments variant, the number of finished steps. */
  value?: number
  /** Total work. In the segments variant, the number of segments (3–8 read well). */
  max?: number
  /** Shown above the bar and used as its accessible name. A new label rises in. */
  label?: string
  /** Text for the value on the right. Defaults to "%NN" (bar) or "02/05" (segments). */
  valueFormat?: (value: number, max: number) => string
  /** Hides the value on the right. */
  hideValue?: boolean
  /** neutral while running, warning when paused, danger on error. `auto` turns success at the end. */
  status?: ProgressBarStatus | "auto"
  /** No total yet: a bar travels the track. When it turns false, the fill starts where that bar is. */
  indeterminate?: boolean
  /** One line under the bar: time left, the error and its retry. A new string rises in. */
  hint?: React.ReactNode
  /** bar for continuous work, segments for a few equal steps. */
  variant?: "bar" | "segments"
  /** Segment look. skew matches Launchpad's header. */
  segmentType?: ProgressSegmentType
}

const percentFormat = (value: number, max: number) => `%${Math.round((value / max) * 100)}`
const stepFormat = (value: number, max: number) => `${String(Math.round(value)).padStart(2, "0")}/${String(max).padStart(2, "0")}`

const segmentShape: Record<ProgressSegmentType, string> = {
  skew: "h-2 flex-1 -skew-x-[20deg] rounded-[2px]",
  block: "h-2 flex-1 rounded-[2px]",
  pill: "h-2 flex-1 rounded-full",
  notch: "h-1.5 flex-1 first:rounded-l-full last:rounded-r-full",
  dot: "size-2.5 rounded-full",
  diamond: "size-2.5 rotate-45 rounded-[2px]",
}
const segmentGap: Record<ProgressSegmentType, string> = { skew: "gap-[3px]", block: "gap-[3px]", pill: "gap-[3px]", notch: "gap-0.5", dot: "gap-3", diamond: "gap-3" }

/**
 * Progress of a task with a known size: an import, a sync, a few setup steps. One spring drives the
 * fill and the number, so they never disagree; the fill slides (not scales) so its rounded end holds.
 * At the end it turns green and a check draws in. For quotas use Meter; for ordered flows use Steps.
 */
function ProgressBar({
  value = 0,
  max = 100,
  label,
  valueFormat,
  hideValue = false,
  status = "auto",
  indeterminate = false,
  hint,
  variant = "bar",
  segmentType = "skew",
  className,
  ...props
}: ProgressBarProps) {
  const reduce = useReducedMotion()
  const safeMax = max > 0 ? max : 100
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const complete = !indeterminate && clamped >= safeMax
  const resolved: ProgressBarStatus = status === "auto" ? (complete ? "success" : "neutral") : status
  const format = valueFormat ?? (variant === "segments" ? stepFormat : percentFormat)
  const text = indeterminate ? "" : format(clamped, safeMax)
  const labelId = React.useId()
  // One spring drives the fill and the number, so they never disagree.
  const trackRef = React.useRef<HTMLDivElement>(null)
  const indeterminateRef = React.useRef<HTMLSpanElement>(null)
  const progress = useFill(clamped, safeMax, indeterminate, indeterminateRef, trackRef)

  return (
    <div
      data-slot="progress-bar"
      data-status={resolved}
      data-variant={variant}
      role="progressbar"
      aria-labelledby={label ? labelId : undefined}
      aria-label={label ? undefined : "İlerleme"}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={indeterminate ? undefined : clamped}
      aria-valuetext={indeterminate ? "Hazırlanıyor" : text}
      className={cn("flex flex-col gap-2", tone[resolved], className)}
      {...props}
    >
      {(label || !hideValue) && (
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          <span id={labelId} className="min-w-0 truncate text-sm font-semibold text-foreground">
            {label && <SwapText>{label}</SwapText>}
          </span>
          {!hideValue && (
            <span className="inline-flex shrink-0 items-center gap-1 text-muted-foreground tabular-nums" aria-hidden>
              {/* Completion lands with the fill: the check settles in beside the final count. */}
              <AnimatePresence initial={false}>
                {complete && (
                  <motion.span
                    key="done"
                    className="flex text-success"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1, transition: reduce ? { duration: 0.12 } : { scale: { ...ICON_SPRING, delay: 0.2 }, opacity: { duration: 0.16, delay: 0.2 } } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  >
                    <CheckGlyph delay={0.2} />
                  </motion.span>
                )}
              </AnimatePresence>
              {variant === "segments" ? (
                <SwapText swapKey={text}>{text}</SwapText>
              ) : (
                <BarCount progress={progress} value={clamped} max={safeMax} format={format} hidden={indeterminate} />
              )}
            </span>
          )}
        </div>
      )}
      {variant === "segments" ? (
        // A new type starts fresh: bar types fill with clip-path, point types with scale, and neither may inherit the other's state.
        <Segments key={segmentType} value={Math.round(clamped)} count={safeMax} type={segmentType} status={resolved} />
      ) : (
        <Bar progress={progress} indeterminate={indeterminate} trackRef={trackRef} indeterminateRef={indeterminateRef} />
      )}
      {hint && (
        <div className="flex min-h-5 items-center text-[12.5px] text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0">
          <SwapText swapKey={typeof hint === "string" ? hint : undefined}>{hint}</SwapText>
        </div>
      )}
    </div>
  )
}

/** Shared spring for the fill and the number; reads the travelling bar's edge when the total arrives. */
function useFill(value: number, max: number, indeterminate: boolean, indeterminateRef: React.RefObject<HTMLSpanElement | null>, trackRef: React.RefObject<HTMLDivElement | null>) {
  const reduce = useReducedMotion()
  const pct = (value / max) * 100
  const progress = useMotionValue(indeterminate ? 0 : pct)
  const wasIndeterminate = React.useRef(indeterminate)

  React.useLayoutEffect(() => {
    if (wasIndeterminate.current && !indeterminate && !reduce && indeterminateRef.current && trackRef.current) {
      const track = trackRef.current.getBoundingClientRect()
      const bar = indeterminateRef.current.getBoundingClientRect()
      // Start where the eye already is, but never ahead of the real value.
      progress.jump(Math.min(pct, Math.max(0, ((bar.right - track.left) / track.width) * 100)))
    }
    wasIndeterminate.current = indeterminate
  }, [indeterminate, pct, progress, reduce, indeterminateRef, trackRef])

  React.useEffect(() => {
    if (indeterminate) return
    if (reduce) return progress.jump(pct)
    const controls = animate(progress, pct, SPRING)
    return () => controls.stop()
  }, [pct, indeterminate, progress, reduce])

  return progress
}

type Progress = ReturnType<typeof useMotionValue<number>>

function Bar({
  progress,
  indeterminate,
  trackRef,
  indeterminateRef,
}: {
  progress: Progress
  indeterminate: boolean
  trackRef: React.RefObject<HTMLDivElement | null>
  indeterminateRef: React.RefObject<HTMLSpanElement | null>
}) {
  const reduce = useReducedMotion()
  const x = useTransform(progress, (p) => `${Math.min(Math.max(p, 0), 100) - 100}%`)

  return (
    <div ref={trackRef} className="relative h-[7px] overflow-hidden rounded-full bg-(--track) transition-colors duration-200 ease-out">
      {/* The fill slides in from the left instead of scaling, so its rounded end keeps its shape. */}
      <motion.span
        className="absolute inset-0 rounded-[inherit] bg-(--fill) transition-colors delay-150 duration-200 ease-out"
        style={{ x }}
        animate={{ opacity: indeterminate ? 0 : 1 }}
        transition={reduce ? INSTANT : { duration: 0.16, ease: EASE_OUT }}
      />
      <AnimatePresence initial={false}>
        {indeterminate && (
          <motion.span
            ref={indeterminateRef}
            key="indeterminate"
            className="absolute inset-y-0 left-0 animate-progress-indeterminate rounded-[inherit] bg-(--fill)"
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/** The number on the right reads the fill's spring. A hidden "max" row reserves its width. */
function BarCount({
  progress,
  value,
  max,
  format,
  hidden,
}: {
  progress: Progress
  value: number
  max: number
  format: (value: number, max: number) => string
  hidden: boolean
}) {
  const [text, setText] = React.useState(() => format(value, max))
  useMotionValueEvent(progress, "change", (p) => setText(format((Math.min(Math.max(p, 0), 100) / 100) * max, max)))

  return (
    // The visible number comes first: the grid takes its baseline from its first item, and the
    // zero-height width reserve would pull the number below the label.
    <span className="inline-grid justify-items-end">
      <span className="col-start-1 row-start-1">{hidden ? "…" : text}</span>
      <span className="invisible col-start-1 row-start-1 h-0 overflow-hidden">{format(max, max)}</span>
    </span>
  )
}

function Segments({ value, count, type, status }: { value: number; count: number; type: ProgressSegmentType; status: ProgressBarStatus }) {
  const reduce = useReducedMotion()
  const travel = useStepTravel(value)
  const point = type === "dot" || type === "diamond"
  // When the last segment's fill ends (its travel delay plus the fill itself), in ms.
  const lastLanding = Math.round((travel.delay(count - 1) + 0.24) * 1000)

  return (
    <div className={cn("flex min-h-3 items-center", segmentGap[type])}>
      {Array.from({ length: count }, (_, i) => {
        const on = i < value
        const isCurrent = i === value && value < count
        const delay = travel.delay(i)
        return (
          <span
            key={i}
            data-state={on ? "done" : isCurrent ? "current" : "upcoming"}
            className={cn(
              "relative bg-border-strong transition-[box-shadow,background-color] duration-200 ease-out",
              point ? "overflow-visible" : "overflow-hidden",
              segmentShape[type],
              // Bars mark the current step with a half tone; points with a halo.
              isCurrent && !point && (status === "danger" ? "bg-danger" : status === "warning" ? "bg-warning" : "bg-[color-mix(in_oklab,var(--chart-ink)_35%,var(--card))]"),
              isCurrent && point && (status === "danger" ? "shadow-[0_0_0_3px_color-mix(in_oklab,var(--danger)_22%,transparent)]" : "shadow-[0_0_0_3px_color-mix(in_oklab,var(--chart-ink)_14%,transparent)]")
            )}
          >
            <motion.i
              className={cn(
                "absolute inset-0 rounded-[inherit] transition-[background-color] duration-200 ease-out motion-reduce:transition-none",
                isCurrent && point && status === "danger" ? "bg-danger" : status === "success" ? "bg-success" : "bg-chart-ink"
              )}
              // Done turns green as a wave from the left once the last segment has landed; undoing turns back at once.
              style={{ transitionDelay: status === "success" && !reduce ? `${lastLanding + i * 40}ms` : "0ms" }}
              initial={false}
              animate={
                point
                  ? { opacity: on || (isCurrent && status === "danger") ? 1 : 0, scale: on || (isCurrent && status === "danger") ? 1 : 0.6 }
                  : { clipPath: on ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }
              }
              transition={
                reduce ? INSTANT
                : point ? { scale: { ...ICON_SPRING, delay }, opacity: { duration: 0.16, delay } }
                : { duration: 0.24, ease: EASE_OUT, delay }
              }
            />
          </span>
        )
      })}
    </div>
  )
}

export { ProgressBar, type ProgressBarProps, type ProgressBarStatus, type ProgressSegmentType }
