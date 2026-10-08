"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { usePlotArea } from "recharts"

import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

/**
 * Shared building blocks for the ikas charts (AreaChart, BarChart, DonutChart…).
 * Charts compose these instead of re-implementing fills, reveals and legends,
 * so every chart moves and reads the same way.
 */

/** Categorical slots in fixed order. Never cycle: a 7th series folds into "Diğer". */
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"] as const

type ChartSeries = {
  /** Data key in each row. */
  key: string
  /** Legend and tooltip label. */
  label: string
  /** Override the slot color. Single-series charts default to --chart-ink. */
  color?: string
  /** Opt-in. dashed for targets, animated-dashed for live or estimated values. */
  strokeStyle?: ChartStrokeStyle
}

type ChartStrokeStyle = "solid" | "dashed" | "animated-dashed"

/** strokeDasharray for a stroke style. */
function strokeDash(style: ChartStrokeStyle | undefined) {
  return style === "dashed" || style === "animated-dashed" ? "5 4" : undefined
}

/**
 * Keyframes for animated-dashed strokes, scoped to the chart. Rendered once per
 * chart that needs it; reduced motion keeps the dashes still.
 */
function ChartMotionStyles() {
  return (
    <style>{`
@keyframes ikas-chart-dash-flow { to { stroke-dashoffset: -18; } }
.ikas-chart-dash-flow .recharts-area-curve, .ikas-chart-dash-flow.recharts-curve, path.ikas-chart-dash-flow { animation: ikas-chart-dash-flow 0.9s linear infinite; }
@media (prefers-reduced-motion: reduce) { .ikas-chart-dash-flow .recharts-area-curve, .ikas-chart-dash-flow.recharts-curve, path.ikas-chart-dash-flow { animation: none; } }
`}</style>
  )
}

/**
 * Soft outer glow in the element's own color: a blurred copy at half strength
 * merged under the original. Opt-in only; one glowing element per screen.
 */
function GlowFilter({ id, blur = 4, strength = 0.5 }: { id: string; blur?: number; strength?: number }) {
  return (
    <filter id={id} x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
      <feComponentTransfer in="blur" result="soft">
        <feFuncA type="linear" slope={strength} />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="soft" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

type ChartBackgroundVariant = "none" | "dots" | "grid" | "diagonal"

/** Subtle plot-area texture in the border color. Pair with <ChartBackground>. */
function ChartBackgroundDefs({ id, variant }: { id: string; variant: ChartBackgroundVariant }) {
  if (variant === "dots")
    return (
      <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="var(--border-strong)" />
      </pattern>
    )
  if (variant === "grid")
    return (
      <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
        <path d="M16 0H0V16" fill="none" stroke="var(--border)" strokeWidth="1" />
      </pattern>
    )
  if (variant === "diagonal")
    return (
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="var(--border)" strokeWidth="1" />
      </pattern>
    )
  return null
}

/** Fills the plot area with a background pattern. Render it inside a recharts chart. */
function ChartBackground({ id, variant }: { id: string; variant: ChartBackgroundVariant }) {
  const plot = usePlotArea()
  if (variant === "none" || !plot) return null
  return <rect x={plot.x} y={plot.y} width={plot.width} height={plot.height} fill={`url(#${id})`} opacity={0.7} pointerEvents="none" />
}

/** Resolves each series to a color: explicit, ink for a lone series, else its slot. */
function resolveSeries<T extends ChartSeries>(series: T[]): (T & { color: string })[] {
  return series.map((s, i) => ({ ...s, color: s.color ?? (series.length === 1 ? "var(--chart-ink)" : CHART_COLORS[i % CHART_COLORS.length]) }))
}

type ChartFillVariant = "gradient" | "solid" | "hatched" | "dotted" | "none"

/**
 * SVG <defs> for one series' fill. Reference it with `fill={chartFill(id, color, variant)}`.
 * Washes stay light (≈10–25%) so the data line, not the fill, carries the value.
 */
function ChartFillDefs({ id, color, variant }: { id: string; color: string; variant: ChartFillVariant }) {
  if (variant === "gradient")
    return (
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={0.28} />
        <stop offset="95%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    )
  if (variant === "hatched")
    return (
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="6" height="6" fill={color} fillOpacity={0.06} />
        <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeOpacity={0.35} strokeWidth="1.5" />
      </pattern>
    )
  if (variant === "dotted")
    return (
      <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r="1" fill={color} fillOpacity={0.45} />
      </pattern>
    )
  return null
}

function chartFill(id: string, color: string, variant: ChartFillVariant) {
  if (variant === "none") return "transparent"
  if (variant === "solid") return color
  return `url(#${id})`
}

type RevealDirection = "left-to-right" | "right-to-left" | "center-out"

/**
 * A mask that wipes a series in once, on mount. Apply it with
 * `style={{ mask: `url(#${id})` }}` on the line, fill and dots together so they
 * reveal in lockstep. Reduced motion shows everything immediately.
 */
function RevealMask({ id, direction = "left-to-right", duration = 0.9 }: { id: string; direction?: RevealDirection; duration?: number }) {
  const reduce = useReducedMotion()
  const originX = direction === "left-to-right" ? 0 : direction === "right-to-left" ? 1 : 0.5

  return (
    <mask id={id} maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
      <motion.rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="white"
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration, ease: EASE_OUT }}
        style={{ originX }}
      />
    </mask>
  )
}

/** A diagonal shimmer that sweeps over a placeholder while a chart loads. */
function ChartLoading({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div role="status" aria-label="Grafik yükleniyor" className={cn("relative overflow-hidden", className)}>
      <div className="opacity-60">{children}</div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-[chart-shimmer_1.6s_var(--ease-in-out)_infinite] bg-linear-to-r from-transparent via-card/80 to-transparent motion-reduce:hidden"
      />
    </div>
  )
}

/**
 * Legend with selectable entries. Clicking an entry focuses that series (others
 * dim); clicking it again clears the focus. Text uses text tokens, the swatch
 * carries the color.
 */
function ChartLegend({
  series,
  active,
  onActiveChange,
  className,
}: {
  series: { key: string; label: string; color: string }[]
  /** Key of the focused series. Others dim. */
  active?: string | null
  onActiveChange?: (key: string | null) => void
  className?: string
}) {
  const interactive = Boolean(onActiveChange)

  return (
    <div role={interactive ? "group" : "list"} aria-label="Seriler" className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {series.map((s) => {
        const dimmed = active != null && active !== s.key
        const content = (
          <>
            <span aria-hidden className="size-2 rounded-[3px] transition-opacity duration-150" style={{ background: s.color, opacity: dimmed ? 0.35 : 1 }} />
            <span className={cn("transition-colors duration-150", dimmed ? "text-muted-foreground" : "text-foreground")}>{s.label}</span>
          </>
        )
        return interactive ? (
          <button
            key={s.key}
            type="button"
            aria-pressed={active === s.key}
            onClick={() => onActiveChange?.(active === s.key ? null : s.key)}
            className="flex items-center gap-1.5 rounded-md text-[13px] outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            {content}
          </button>
        ) : (
          <span key={s.key} role="listitem" className="flex items-center gap-1.5 text-[13px]">
            {content}
          </span>
        )
      })}
    </div>
  )
}

type TooltipRow = { key: string; label: string; color: string; value: number | null | undefined }

/** Tooltip surface shared by all charts. Values are right-aligned and tabular. */
function ChartTooltipCard({
  title,
  rows,
  format,
  note,
}: {
  title?: React.ReactNode
  rows: TooltipRow[]
  /** Formats each row's value. */
  format: (value: number) => string
  /** Short qualifier next to the title, e.g. "Tahmini" or "Devam ediyor". */
  note?: React.ReactNode
}) {
  return (
    <div className="flex min-w-40 flex-col gap-1.5 rounded-lg bg-popover px-3 py-2 text-xs shadow-overlay">
      {(title != null || note != null) && (
        <span className="flex items-center justify-between gap-3">
          {title != null && <span className="font-medium text-foreground">{title}</span>}
          {note != null && <span className="rounded-[4px] bg-muted px-1.5 py-px text-[11px] font-medium text-muted-foreground">{note}</span>}
        </span>
      )}
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <span aria-hidden className="size-2 shrink-0 rounded-[3px]" style={{ background: row.color }} />
          <span className="flex-1 text-muted-foreground">{row.label}</span>
          <span className="font-medium text-foreground tabular-nums">{row.value == null ? "—" : format(row.value)}</span>
        </div>
      ))}
    </div>
  )
}

const defaultNumberFormat = (value: number) => new Intl.NumberFormat("tr-TR").format(value)
const compactNumberFormat = (value: number) => new Intl.NumberFormat("tr-TR", { notation: "compact", maximumFractionDigits: 1 }).format(value)

export {
  CHART_COLORS,
  ChartBackground,
  ChartBackgroundDefs,
  ChartMotionStyles,
  GlowFilter,
  strokeDash,
  type ChartBackgroundVariant,
  type ChartStrokeStyle,
  ChartFillDefs,
  ChartLegend,
  ChartLoading,
  ChartTooltipCard,
  RevealMask,
  chartFill,
  compactNumberFormat,
  defaultNumberFormat,
  resolveSeries,
  type ChartFillVariant,
  type ChartSeries,
  type RevealDirection,
  type TooltipRow,
}
