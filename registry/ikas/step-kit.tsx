"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion, type Transition } from "motion/react"

import { EASE_OUT, ICON_SPRING, INSTANT, SPRING, STAGGER } from "@/lib/motion"
import { cn } from "@/lib/utils"

type StepStatus = "upcoming" | "current" | "done" | "error" | "blocked"
type StepMarkerShape = "diamond" | "circle" | "square" | "pill"

const StepMarkerContext = React.createContext<StepMarkerShape | null>(null)

/** The marker shape here: the marker's own `shape`, else the nearest StepMarkerProvider, else `diamond` (Launchpad's). */
function useStepMarkerShape(shape?: StepMarkerShape): StepMarkerShape {
  const inherited = React.useContext(StepMarkerContext)
  return shape ?? inherited ?? "diamond"
}

type StepMarkerProviderProps = {
  /** Shape for every StepMarker, Steps, Launchpad and segmented ProgressBar inside. */
  shape: StepMarkerShape
  children?: React.ReactNode
}

/** Sets the step marker shape once for the app, so steppers and setup lists match. */
function StepMarkerProvider({ shape, children }: StepMarkerProviderProps) {
  return <StepMarkerContext.Provider value={shape}>{children}</StepMarkerContext.Provider>
}

/** Marker width in px per shape. Steps uses it to place connectors. */
const markerWidth = (shape: StepMarkerShape, size: "default" | "sm") => (size === "sm" ? (shape === "pill" ? 26 : 18) : shape === "pill" ? 36 : 26)

const shapes: Record<StepMarkerShape, { halo: string; disc: string }> = {
  diamond: { halo: "rotate-45 rounded-[7px]", disc: "inset-0.5 rotate-45 rounded-[5px]" },
  circle: { halo: "rounded-full", disc: "inset-px rounded-full" },
  square: { halo: "rounded-[9px]", disc: "inset-px rounded-md" },
  pill: { halo: "rounded-full", disc: "inset-x-px inset-y-0.5 rounded-full" },
}

const discStatus: Record<StepStatus, string> = {
  upcoming: "bg-card shadow-[inset_0_0_0_1.5px_var(--border-strong)]",
  current: "bg-card shadow-[inset_0_0_0_1.5px_var(--chart-ink)]",
  done: "bg-chart-ink shadow-[inset_0_0_0_1.5px_var(--chart-ink)]",
  error: "bg-[color-mix(in_oklab,var(--danger)_12%,var(--card))] shadow-[inset_0_0_0_1.5px_var(--danger)]",
  blocked: "bg-card border-[1.5px] border-dashed border-border-strong",
}

const glyphStatus: Record<StepStatus, string> = {
  upcoming: "text-muted-foreground",
  current: "text-foreground",
  done: "text-card",
  error: "text-danger",
  blocked: "text-muted-foreground",
}

/** A check that draws itself after `delay` seconds. */
function CheckGlyph({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={cn("size-3.5", className)}>
      <motion.path
        d="M5.5 12.5l4.25 4.25L18.5 8"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduce ? INSTANT : { duration: 0.24, ease: EASE_OUT, delay: delay + 0.04 }}
      />
    </svg>
  )
}

/** An exclamation mark: the stem draws, the dot pops after it. */
function AlertGlyph({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden className={cn("size-3.5", className)}>
      <motion.path
        d="M12 6.75v6.5"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={reduce ? INSTANT : { duration: 0.24, ease: EASE_OUT, delay: delay + 0.04 }}
      />
      <motion.circle
        cx="12"
        cy="17.4"
        r="1.3"
        fill="currentColor"
        stroke="none"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? INSTANT : { ...ICON_SPRING, delay: delay + 0.16 }}
      />
    </svg>
  )
}

/** Icons swap in place: the old one shrinks away, the new one grows from 0.6 (never from 0) on ICON_SPRING. */
function glyphMotion(reduce: boolean | null, delay: number) {
  if (reduce) return { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.12 } }, exit: { opacity: 0, transition: { duration: 0.1 } } }
  const fade: Transition = { duration: 0.16, ease: EASE_OUT, delay }
  return {
    initial: { opacity: 0, scale: 0.6, filter: "blur(2px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { scale: { ...ICON_SPRING, delay }, opacity: fade, filter: fade } },
    exit: { opacity: 0, scale: 0.6, filter: "blur(2px)", transition: { duration: 0.12, ease: EASE_OUT } },
  }
}

type StepMarkerProps = Omit<React.ComponentProps<"span">, "children"> & {
  status: StepStatus
  /** Number shown while the step is not done. Hidden at `size="sm"`. */
  index?: number
  /** diamond (default), circle, square or pill. Defaults to the StepMarkerProvider's. */
  shape?: StepMarkerShape
  /** sm is 18px: compact steppers and checklist boxes. */
  size?: "default" | "sm"
  /** Seconds to wait before the glyph and halo change, so a multi-step jump lands in order. */
  delay?: number
}

/**
 * One step's marker. Done fills with ink and a check draws itself; the current step gets a halo
 * that grows behind it; an error turns red with an exclamation mark.
 */
function StepMarker({ status, index, shape: shapeProp, size = "default", delay = 0, className, style, ...props }: StepMarkerProps) {
  const reduce = useReducedMotion()
  const shape = useStepMarkerShape(shapeProp)
  const width = markerWidth(shape, size)
  const height = size === "sm" ? 18 : 26
  const halo = status === "current" || status === "error"
  const glyph =
    status === "done" ? <CheckGlyph delay={delay} className={size === "sm" ? "size-3" : undefined} />
    : status === "error" ? <AlertGlyph delay={delay} className={size === "sm" ? "size-3" : undefined} />
    : size === "sm" || index === undefined ? null
    : <span className="font-mono text-[11px] font-semibold tabular-nums">{index}</span>
  const glyphKey = status === "done" ? "done" : status === "error" ? "error" : `n${size === "sm" ? "" : index}`

  return (
    <span
      data-slot="step-marker"
      data-status={status}
      data-shape={shape}
      aria-hidden
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width, height, ...style }}
      {...props}
    >
      <AnimatePresence initial={false}>
        {halo && (
          <motion.span
            key="halo"
            className={cn("absolute", size === "sm" ? "-inset-1" : "-inset-[5px]", shapes[shape].halo, status === "error" ? "bg-danger/15" : "bg-chart-ink/10")}
            {...(reduce
              ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
              : {
                  initial: { opacity: 0, scale: 0.6 },
                  animate: { opacity: 1, scale: 1, transition: { scale: { ...ICON_SPRING, delay: delay + 0.1 }, opacity: { duration: 0.16, delay: delay + 0.1 } } },
                  exit: { opacity: 0, scale: 0.6, transition: { duration: 0.12 } },
                })}
          />
        )}
      </AnimatePresence>
      <span
        className={cn(
          "absolute transition-[background-color,box-shadow,border-color] duration-200 ease-out motion-reduce:transition-none",
          size === "sm" && shape === "diamond" ? "inset-[1.5px] rotate-45 rounded-[3.5px]" : shapes[shape].disc,
          discStatus[status]
        )}
      />
      <span className={cn("relative grid place-items-center transition-colors duration-200 ease-out", glyphStatus[status])}>
        <AnimatePresence initial={false}>
          {glyph && (
            <motion.span key={glyphKey} className="col-start-1 row-start-1 grid place-items-center" {...glyphMotion(reduce, delay)}>
              {glyph}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </span>
  )
}

type StepConnectorProps = Omit<React.ComponentProps<"span">, "children"> & {
  filled: boolean
  orientation?: "horizontal" | "vertical"
  /** Seconds to wait before filling or draining. */
  delay?: number
}

/** The line between two steps. Fills from the done side on SPRING; drains back the same way. */
function StepConnector({ filled, orientation = "horizontal", delay = 0, className, ...props }: StepConnectorProps) {
  const reduce = useReducedMotion()
  const horizontal = orientation === "horizontal"
  return (
    <span
      data-slot="step-connector"
      aria-hidden
      className={cn("relative overflow-hidden rounded-full bg-border-strong", horizontal ? "h-[1.5px]" : "w-[1.5px]", className)}
      {...props}
    >
      <motion.span
        className={cn("absolute inset-0 bg-chart-ink", horizontal ? "origin-left" : "origin-top")}
        initial={false}
        animate={horizontal ? { scaleX: filled ? 1 : 0 } : { scaleY: filled ? 1 : 0 }}
        transition={reduce ? INSTANT : { ...SPRING, delay }}
      />
    </span>
  )
}

/**
 * Remembers where `current` came from, so a jump over several steps fills one connector after another
 * (STAGGER apart) and drains from the far end when going back. The new current step's halo waits for
 * the last connector to start.
 */
function useStepTravel(current: number) {
  const [travel, setTravel] = React.useState({ from: current, to: current })
  if (travel.to !== current) setTravel({ from: travel.to, to: current })
  const { from, to } = travel
  const forward = to >= from
  return {
    forward,
    /** Delay in seconds for the change at index i (connector i, or step i). */
    delay: (i: number) => Math.max(0, forward ? i - from : from - 1 - i) * STAGGER,
    /** Delay in seconds for the marker that becomes current. */
    landing: Math.max(0, Math.abs(to - from) - 1) * STAGGER,
  }
}

export {
  AlertGlyph,
  CheckGlyph,
  StepConnector,
  StepMarker,
  StepMarkerProvider,
  markerWidth,
  useStepMarkerShape,
  useStepTravel,
  type StepConnectorProps,
  type StepMarkerProps,
  type StepMarkerProviderProps,
  type StepMarkerShape,
  type StepStatus,
}
