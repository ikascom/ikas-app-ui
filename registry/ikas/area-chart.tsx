"use client"

import * as React from "react"
import { useReducedMotion } from "motion/react"
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import {
  ChartBackground,
  ChartBackgroundDefs,
  ChartFillDefs,
  ChartMotionStyles,
  GlowFilter,
  strokeDash,
  type ChartBackgroundVariant,
  ChartLegend,
  ChartLoading,
  ChartTooltipCard,
  RevealMask,
  chartFill,
  compactNumberFormat,
  defaultNumberFormat,
  resolveSeries,
  type ChartSeries,
  type RevealDirection,
} from "@/components/ikas/chart-kit"

type AreaChartVariant = "gradient" | "solid" | "hatched" | "dotted" | "line"

type AreaChartProps<T extends Record<string, unknown>> = {
  /** Rows, in x order. */
  data: T[]
  /** Key of the x value in each row (date, month…). */
  index: keyof T & string
  /** One entry per area. Colors follow the categorical order; a lone series is ink. */
  series: ChartSeries[]
  /** Fill style. `line` draws the stroke only. */
  variant?: AreaChartVariant
  /** Line interpolation between points. */
  curve?: "monotone" | "linear" | "step" | "bump"
  /** Stack series on top of each other (parts of a whole over time). */
  stacked?: boolean
  /** Intro wipe. Plays once on mount; skipped with reduced motion. */
  reveal?: RevealDirection | "none"
  /** Shows a shimmering placeholder instead of the data. */
  loading?: boolean
  /** Formats values in the tooltip. Defaults to tr-TR numbers. */
  valueFormat?: (value: number) => string
  /** Formats y-axis ticks. Defaults to compact tr-TR (12,4 B). */
  yFormat?: (value: number) => string
  /** Formats x-axis ticks and the tooltip title. */
  xFormat?: (value: string) => string
  /** Plot height in px. */
  height?: number
  /** Legend is shown automatically for 2+ series. */
  showLegend?: boolean
  /** Accessible summary of what the chart shows. */
  "aria-label"?: string
  className?: string
  /** Expressive, opt-in: soft glow under the lines. */
  glow?: boolean
  /** Expressive, opt-in: subtle texture behind the plot. */
  background?: ChartBackgroundVariant
  /** Draw the last N points as an estimate: dashed line, lighter wash, "Tahmini" in the tooltip. */
  projectedLast?: number
  /** Animate data changes (live data). Off by default; the reveal handles the first paint. */
  animateUpdates?: boolean
}

const PROJECTED = "__projected"

/** Active point: filled dot with a surface ring, plus a soft pulse around it. */
function ActiveDot({ cx, cy, color }: { cx?: number; cy?: number; color: string }) {
  if (cx == null || cy == null) return null
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        fillOpacity={0.3}
        className="origin-center animate-ping [animation-duration:1.6s] [transform-box:fill-box] motion-reduce:animate-none"
      />
      <circle cx={cx} cy={cy} r={4.5} fill={color} stroke="var(--card)" strokeWidth={2} />
    </g>
  )
}

/** Muted wave drawn while loading. Static shape; the shimmer does the moving. */
function LoadingWave({ height }: { height: number }) {
  const points = Array.from({ length: 25 }, (_, i) => {
    const x = (i / 24) * 400
    const y = 58 - Math.sin(i / 3.2) * 16 - Math.sin(i / 1.7) * 6 - i * 0.9
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = `M${points.join(" L")}`

  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden>
      {[20, 45, 70, 95].map((y) => (
        <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={`${line} L400,100 L0,100 Z`} fill="var(--muted-foreground)" fillOpacity={0.08} />
      <path d={line} fill="none" stroke="var(--border-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/**
 * Change over time for one to six series. Thin 2px lines over a light wash,
 * horizontal hairline grid, one y-axis, crosshair tooltip. Series reveal from
 * left to right on mount and can be focused from the legend.
 */
function AreaChart<T extends Record<string, unknown>>({
  data,
  index,
  series,
  variant = "gradient",
  curve = "monotone",
  stacked = false,
  reveal = "left-to-right",
  loading = false,
  valueFormat = defaultNumberFormat,
  yFormat = compactNumberFormat,
  xFormat,
  height = 240,
  showLegend,
  "aria-label": ariaLabel,
  className,
  glow = false,
  background = "none",
  projectedLast = 0,
  animateUpdates = false,
}: AreaChartProps<T>) {
  const id = React.useId().replace(/:/g, "")
  const reduceMotion = useReducedMotion()
  const resolved = resolveSeries(series)
  const [active, setActive] = React.useState<string | null>(null)
  const legend = showLegend ?? resolved.length > 1
  const maskId = reveal === "none" || reduceMotion ? undefined : `${id}-reveal`
  const config = Object.fromEntries(resolved.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig
  const animate = animateUpdates && !reduceMotion
  const flows = resolved.some((s) => s.strokeStyle === "animated-dashed")

  // Projection: the split point belongs to both halves so the dashed tail joins the solid line.
  const split = projectedLast > 0 ? Math.max(0, data.length - 1 - projectedLast) : -1
  const rows: Record<string, unknown>[] =
    split < 0
      ? data
      : data.map((row, i) => {
          const next: Record<string, unknown> = { ...row }
          for (const s of resolved) {
            next[`${s.key}${PROJECTED}`] = i >= split ? row[s.key] : null
            if (i > split) next[s.key] = null
          }
          return next
        })

  return (
    <div data-slot="area-chart" className={cn("flex w-full flex-col gap-3", className)}>
      {flows && <ChartMotionStyles />}
      {legend && <ChartLegend series={resolved} active={active} onActiveChange={setActive} />}
      {loading ? (
        <ChartLoading className="rounded-md">
          <LoadingWave height={height} />
        </ChartLoading>
      ) : (
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height }} role="img" aria-label={ariaLabel}>
          <RechartsAreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              {glow && <GlowFilter id={`${id}-glow`} />}
              {background !== "none" && <ChartBackgroundDefs id={`${id}-bg`} variant={background} />}
              {maskId && <RevealMask id={maskId} direction={reveal === "none" ? undefined : reveal} />}
              {resolved.map((s) => (
                <ChartFillDefs key={s.key} id={`${id}-fill-${s.key}`} color={s.color} variant={variant === "line" ? "none" : variant} />
              ))}
            </defs>
            {background !== "none" && <ChartBackground id={`${id}-bg`} variant={background} />}
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
            <XAxis
              dataKey={index as string}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={24}
              tick={{ fontSize: 12 }}
              tickFormatter={xFormat ? (value) => xFormat(String(value)) : undefined}
            />
            <YAxis
              width={56}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickCount={4}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => yFormat(Number(value))}
            />
            <Tooltip
              cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
              isAnimationActive={false}
              content={({ active: open, payload, label }) => {
                if (!open || !payload?.length) return null
                const row = payload[0]?.payload as Record<string, unknown> | undefined
                const at = rows.indexOf(row as Record<string, unknown>)
                const estimated = split >= 0 && at > split
                return (
                  <ChartTooltipCard
                    title={xFormat ? xFormat(String(label)) : String(label)}
                    note={estimated ? "Tahmini" : undefined}
                    format={valueFormat}
                    rows={resolved.map((s) => ({
                      key: s.key,
                      label: s.label,
                      color: s.color,
                      value: (row?.[s.key] ?? row?.[`${s.key}${PROJECTED}`]) as number | null | undefined,
                    }))}
                  />
                )
              }}
            />
            {resolved.map((s) => {
              const dimmed = active != null && active !== s.key
              const fillVariant = variant === "line" ? "none" : variant === "solid" ? "solid" : variant
              const fillOpacity = variant === "solid" ? (dimmed ? 0.04 : 0.14) : variant === "gradient" ? (dimmed ? 0.15 : 0.65) : dimmed ? 0.25 : 1
              const masked = maskId ? { mask: `url(#${maskId})` } : {}
              const transition = { transition: "stroke-opacity 150ms var(--ease-out), fill-opacity 150ms var(--ease-out)" }
              return (
                <React.Fragment key={s.key}>
                  {glow && !dimmed && (
                    <Area
                      type={curve}
                      dataKey={s.key}
                      stackId={stacked ? "glow" : undefined}
                      stroke={s.color}
                      strokeWidth={2}
                      fill="none"
                      dot={false}
                      activeDot={false}
                      tooltipType="none"
                      legendType="none"
                      isAnimationActive={false}
                      filter={`url(#${id}-glow)`}
                      style={{ ...masked, pointerEvents: "none" }}
                    />
                  )}
                  <Area
                    type={curve}
                    dataKey={s.key}
                    name={s.label}
                    stackId={stacked ? "stack" : undefined}
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={strokeDash(s.strokeStyle)}
                    className={s.strokeStyle === "animated-dashed" ? "ikas-chart-dash-flow" : undefined}
                    strokeOpacity={dimmed ? 0.25 : 1}
                    fill={chartFill(`${id}-fill-${s.key}`, s.color, fillVariant)}
                    fillOpacity={fillOpacity}
                    dot={false}
                    activeDot={dimmed ? false : (props: { cx?: number; cy?: number }) => <ActiveDot cx={props.cx} cy={props.cy} color={s.color} />}
                    isAnimationActive={animate}
                    animationDuration={600}
                    animationEasing="ease-out"
                    style={{ ...transition, ...masked }}
                  />
                  {split >= 0 && (
                    <Area
                      type={curve}
                      dataKey={`${s.key}${PROJECTED}`}
                      name={`${s.label} (tahmini)`}
                      stackId={stacked ? "projected" : undefined}
                      stroke={s.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                      strokeOpacity={dimmed ? 0.2 : 0.75}
                      fill={chartFill(`${id}-fill-${s.key}`, s.color, fillVariant)}
                      fillOpacity={fillOpacity * 0.45}
                      dot={false}
                      activeDot={dimmed ? false : (props: { cx?: number; cy?: number }) => <ActiveDot cx={props.cx} cy={props.cy} color={s.color} />}
                      tooltipType="none"
                      legendType="none"
                      isAnimationActive={false}
                      style={{ ...transition, ...masked }}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </RechartsAreaChart>
        </ChartContainer>
      )}
    </div>
  )
}

export { AreaChart, type AreaChartProps, type AreaChartVariant }
