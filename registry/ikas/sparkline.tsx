"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { ChartFillDefs, RevealMask, chartFill } from "@/components/ikas/chart-kit"

type SparklineProps = Omit<React.ComponentProps<"div">, "color"> & {
  /** Values in time order. Twelve to thirty points read best. */
  data: number[]
  /** Height in px. Width follows the container. */
  height?: number
  /** `area` adds a light wash under the line. */
  variant?: "area" | "line"
  /** Line color. Defaults to ink: a sparkline is context, not a series to identify. */
  color?: string
  /** Color of the end dot, to point at the current period. Defaults to `color`. */
  highlightColor?: string
  /** Wipe in from the left on mount. */
  reveal?: boolean
  /** Accessible summary, e.g. "Son 14 günde artış". Hidden from screen readers when omitted. */
  "aria-label"?: string
}

const VIEW_WIDTH = 100

/** Smooth path through the points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: [number, number][]) {
  if (points.length < 2) return ""
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
  }
  return d
}

/**
 * A tiny trend line for stat cards and table cells. No axes, no grid, no
 * tooltip: the number next to it carries the value, the line carries the shape.
 */
function Sparkline({
  data,
  height = 32,
  variant = "area",
  color = "var(--chart-ink)",
  highlightColor,
  reveal = true,
  className,
  "aria-label": ariaLabel,
  ...props
}: SparklineProps) {
  const id = React.useId().replace(/:/g, "")
  const reduceMotion = useReducedMotion()
  const pad = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i): [number, number] => [
    data.length === 1 ? VIEW_WIDTH / 2 : (i / (data.length - 1)) * VIEW_WIDTH,
    pad + (1 - (v - min) / range) * (height - pad * 2),
  ])
  const line = smoothPath(points)
  const last = points[points.length - 1]
  const maskId = reveal && !reduceMotion ? `${id}-reveal` : undefined

  return (
    <div
      data-slot="sparkline"
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn("relative w-full", className)}
      style={{ height }}
      {...props}
    >
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
        <defs>
          {maskId && <RevealMask id={maskId} duration={0.8} />}
          {variant === "area" && <ChartFillDefs id={`${id}-fill`} color={color} variant="gradient" />}
        </defs>
        <g style={maskId ? { mask: `url(#${maskId})` } : undefined}>
          {variant === "area" && line && <path d={`${line} L${VIEW_WIDTH},${height} L0,${height} Z`} fill={chartFill(`${id}-fill`, color, "gradient")} />}
          <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      {last && (
        <span
          aria-hidden
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card duration-300 animate-in fade-in-0 zoom-in-50 fill-mode-both motion-reduce:animate-none"
          style={{
            left: `${(last[0] / VIEW_WIDTH) * 100}%`,
            top: last[1],
            background: highlightColor ?? color,
            animationDelay: maskId ? "700ms" : undefined,
          }}
        />
      )}
    </div>
  )
}

export { Sparkline, type SparklineProps }
