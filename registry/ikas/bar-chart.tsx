"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ReferenceLine, Tooltip, XAxis, YAxis, type BarShapeProps } from "recharts"

import { SPRING } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import {
  ChartBackground,
  ChartBackgroundDefs,
  ChartLegend,
  GlowFilter,
  type ChartBackgroundVariant,
  ChartLoading,
  ChartTooltipCard,
  compactNumberFormat,
  defaultNumberFormat,
  resolveSeries,
  type ChartSeries,
} from "@/components/ikas/chart-kit"

/** Bars never fill their slot: 24px max leaves air between categories. */
const MAX_BAR = 24
/** Rounded data-end; the baseline stays square. */
const RADIUS = 4
/** Surface gap between stacked segments and grouped bars. */
const GAP = 2
const Y_AXIS_WIDTH = 52

type BarChartVariant = "solid" | "hatched" | "duotone" | "gradient"

type BarChartProps<T extends Record<string, unknown>> = {
  data: T[]
  /** Category key, e.g. "month". */
  index: keyof T & string
  /** One entry per bar series. Colors follow the categorical order. */
  series: ChartSeries[]
  /** Fill style. Solid for most charts; the others add texture without adding color. */
  variant?: BarChartVariant
  /** vertical = columns, horizontal = bars growing to the right (long category names). */
  layout?: "vertical" | "horizontal"
  /** Stack series into one bar per category. */
  stacked?: boolean
  /** hover-trace dims the other bars and draws a line at the hovered value. Default for a single series. */
  highlight?: "hover-trace" | "none"
  /** Shows a shimmering placeholder instead of the data. */
  loading?: boolean
  /** Formats values in the tooltip. Defaults to tr-TR numbers. */
  valueFormat?: (value: number) => string
  /** Axis tick format. Defaults to compact (12,4 B). */
  axisFormat?: (value: number) => string
  /** Plot height in px. */
  height?: number
  className?: string
  /** Accessible summary of what the chart shows. */
  "aria-label"?: string
  /** Expressive, opt-in: the hovered bar glows in its own color. */
  glow?: boolean
  /** The last category is still in progress: hatched fill and "Devam ediyor" in the tooltip. */
  incompleteLast?: boolean
  /** Expressive, opt-in: subtle texture behind the plot. */
  background?: ChartBackgroundVariant
}

/** Path with a rounded data-end and a square baseline, the dataviz bar spec. */
function barPath(x: number, y: number, w: number, h: number, horizontal: boolean, rounded: boolean) {
  if (w <= 0 || h <= 0) return ""
  const r = rounded ? Math.min(RADIUS, horizontal ? h / 2 : w / 2, horizontal ? w : h) : 0
  if (horizontal)
    return `M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z`
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`
}

function FillDefs({ id, color, variant, horizontal }: { id: string; color: string; variant: BarChartVariant; horizontal: boolean }) {
  if (variant === "gradient")
    return (
      <linearGradient id={id} x1="0" y1="0" x2={horizontal ? "1" : "0"} y2={horizontal ? "0" : "1"}>
        <stop offset="0%" stopColor={color} stopOpacity={horizontal ? 0.35 : 1} />
        <stop offset="100%" stopColor={color} stopOpacity={horizontal ? 1 : 0.35} />
      </linearGradient>
    )
  if (variant === "duotone")
    return (
      <linearGradient id={id} x1="0" y1="0" x2={horizontal ? "0" : "1"} y2={horizontal ? "1" : "0"}>
        <stop offset="50%" stopColor={color} stopOpacity={1} />
        <stop offset="50%" stopColor={color} stopOpacity={0.72} />
      </linearGradient>
    )
  if (variant === "hatched")
    return (
      <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="5" height="5" fill={color} fillOpacity={0.16} />
        <line x1="0" y1="0" x2="0" y2="5" stroke={color} strokeOpacity={0.7} strokeWidth="1.5" />
      </pattern>
    )
  return null
}

/**
 * recharts remounts every rectangle whenever the tooltip state changes, so a
 * plain mount animation would regrow all bars on each hover. The chart records
 * when its intro has played; remounted bars after that start in place.
 */
type BarHoverState = {
  dimmed: (index: number, seriesKey: string) => boolean
  glowing: (index: number, seriesKey: string) => boolean
  introPlayed: React.RefObject<boolean>
}

const BarHoverContext = React.createContext<BarHoverState>({ dimmed: () => false, glowing: () => false, introPlayed: { current: false } })

type ShapeExtra = {
  /** Fill for this bar when it is the in-progress last category. */
  incompleteFill?: string
  lastIndex: number
  glowFilter?: string
  seriesKey: string
  seriesKeys: string[]
  fill: string
  horizontal: boolean
  stacked: boolean
  animate: boolean
}

function BarShape(props: BarShapeProps & ShapeExtra) {
  const { x = 0, y = 0, width = 0, height = 0, index, payload, background, seriesKey, seriesKeys, fill, horizontal, stacked, animate, incompleteFill, lastIndex, glowFilter } = props
  const { dimmed, glowing, introPlayed } = React.useContext(BarHoverContext)
  const grow = animate && !introPlayed.current
  const row = payload as Record<string, unknown>
  // In a stack only the outermost non-empty segment gets the rounded end.
  const outermost = !stacked || [...seriesKeys].reverse().find((k) => Number(row?.[k] ?? 0) > 0) === seriesKey

  const bx = Number(x)
  let by = Number(y)
  let bw = Number(width)
  let bh = Number(height)
  if (stacked && !outermost) {
    if (horizontal) bw -= GAP
    else {
      by += GAP
      bh -= GAP
    }
  }

  const baseline = horizontal ? Number(background?.x ?? bx) : Number(background?.y ?? 0) + Number(background?.height ?? 0)

  return (
    <motion.path
      d={barPath(bx, by, bw, bh, horizontal, outermost)}
      fill={incompleteFill && index === lastIndex ? incompleteFill : fill}
      filter={glowFilter && glowing(index, seriesKey) ? glowFilter : undefined}
      initial={grow ? (horizontal ? { scaleX: 0 } : { scaleY: 0 }) : false}
      animate={{ scaleX: 1, scaleY: 1, opacity: dimmed(index, seriesKey) ? 0.3 : 1 }}
      transition={{
        scaleX: { ...SPRING, delay: index * 0.035 },
        scaleY: { ...SPRING, delay: index * 0.035 },
        opacity: { duration: 0.15 },
      }}
      style={{
        transformBox: "view-box",
        originX: horizontal ? `${baseline}px` : `${bx + bw / 2}px`,
        originY: horizontal ? `${by + bh / 2}px` : `${baseline}px`,
      }}
    />
  )
}

/** The line and value pill that follow the hovered bar. */
function TraceLine({ x1 = 0, y1 = 0, x2 = 0, y2 = 0, value, horizontal, format }: { x1?: number; y1?: number; x2?: number; y2?: number; value: number; horizontal: boolean; format: (v: number) => string }) {
  const reduce = useReducedMotion()
  const transition = reduce ? { duration: 0 } : SPRING

  if (horizontal)
    return (
      <motion.g initial={false} animate={{ x: x1 }} transition={transition}>
        <line x1={0} x2={0} y1={y1} y2={y2} stroke="var(--foreground)" strokeOpacity={0.35} strokeWidth={1} />
        <foreignObject x={-40} y={y2 + 4} width={80} height={24} overflow="visible">
          <div className="flex justify-center">
            <AnimatedNumber value={value} format={format} className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background tabular-nums shadow-overlay" />
          </div>
        </foreignObject>
      </motion.g>
    )

  return (
    <motion.g initial={false} animate={{ y: y1 }} transition={transition}>
      <line x1={x1} x2={x2} y1={0} y2={0} stroke="var(--foreground)" strokeOpacity={0.35} strokeWidth={1} />
      <foreignObject x={x1 - Y_AXIS_WIDTH} y={-11} width={Y_AXIS_WIDTH - 4} height={22} overflow="visible">
        <div className="flex h-full items-center justify-end">
          <AnimatedNumber value={value} format={format} className="rounded-md bg-foreground px-1.5 py-0.5 text-[11px] font-medium text-background tabular-nums shadow-overlay" />
        </div>
      </foreignObject>
    </motion.g>
  )
}

/** Placeholder columns under a shimmer while data loads. */
function BarChartSkeleton({ height, horizontal }: { height: number; horizontal: boolean }) {
  const lengths = [42, 68, 55, 80, 62, 90, 48, 74, 58, 84, 66, 52]
  return (
    <ChartLoading>
      <div
        className={cn("flex gap-3 border-b border-border px-2", horizontal ? "flex-col justify-around border-b-0 border-l py-2" : "items-end justify-around")}
        style={{ height }}
      >
        {(horizontal ? lengths.slice(0, 6) : lengths).map((l, i) => (
          <span
            key={i}
            className={cn("rounded-t-[4px] bg-foreground/[0.08]", horizontal && "rounded-t-none rounded-r-[4px]")}
            style={horizontal ? { width: `${l}%`, height: 16 } : { height: `${l}%`, width: 20 }}
          />
        ))}
      </div>
    </ChartLoading>
  )
}

/**
 * Column and bar chart. Bars grow from the baseline on mount with a short
 * stagger; hovering traces the value with a line and an animated pill.
 */
function BarChart<T extends Record<string, unknown>>({
  data,
  index,
  series: seriesProp,
  variant = "solid",
  layout = "vertical",
  stacked = false,
  highlight,
  loading = false,
  valueFormat = defaultNumberFormat,
  axisFormat = compactNumberFormat,
  height = 280,
  className,
  "aria-label": ariaLabel,
  glow = false,
  incompleteLast = false,
  background = "none",
}: BarChartProps<T>) {
  const id = React.useId().replace(/:/g, "")
  const reduce = useReducedMotion()
  const series = resolveSeries(seriesProp)
  const horizontal = layout === "horizontal"
  const trace = (highlight ?? (series.length === 1 ? "hover-trace" : "none")) === "hover-trace"
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [activeSeries, setActiveSeries] = React.useState<string | null>(null)
  const seriesKeys = series.map((s) => s.key)

  const config = Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig

  const lastIndex = data.length - 1
  const introPlayed = React.useRef(false)
  React.useEffect(() => {
    // Longest stagger plus the spring settling; after this bars never regrow.
    const done = window.setTimeout(() => (introPlayed.current = true), data.length * 35 + 700)
    return () => window.clearTimeout(done)
  }, [data.length])

  if (loading)
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <BarChartSkeleton height={height} horizontal={horizontal} />
      </div>
    )

  const tracedValue =
    trace && activeIndex != null && data[activeIndex]
      ? stacked
        ? seriesKeys.reduce((sum, k) => sum + Number(data[activeIndex][k] ?? 0), 0)
        : Number(data[activeIndex][series[0].key] ?? 0)
      : null

  const glowing = (i: number, key: string) => activeIndex === i && (activeSeries == null || activeSeries === key)

  const dimmed = (i: number, key: string) => (activeSeries != null && activeSeries !== key) || (trace && activeIndex != null && activeIndex !== i)

  const categoryAxis = {
    dataKey: index as string,
    type: "category" as const,
    tickLine: false,
    axisLine: false,
    tickMargin: 8,
    interval: "preserveStartEnd" as const,
  }
  const valueAxis = {
    type: "number" as const,
    tickLine: false,
    axisLine: false,
    tickMargin: 4,
    tickFormatter: (v: number) => axisFormat(v),
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {series.length > 1 && <ChartLegend series={series} active={activeSeries} onActiveChange={setActiveSeries} />}
      <BarHoverContext.Provider value={{ dimmed, glowing, introPlayed }}>
      <ChartContainer config={config} className="aspect-auto w-full" style={{ height }} aria-label={ariaLabel} role="img">
        <RechartsBarChart
          accessibilityLayer
          data={data as Record<string, unknown>[]}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barCategoryGap={horizontal ? "28%" : "22%"}
          barGap={GAP}
          onMouseMove={(state) => {
            const i = state?.activeTooltipIndex
            setActiveIndex(i == null ? null : Number(i))
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            {series.map((s) => (
              <FillDefs key={s.key} id={`${id}-${s.key}`} color={s.color} variant={variant} horizontal={horizontal} />
            ))}
            {incompleteLast &&
              series.map((s) => <FillDefs key={`${s.key}-incomplete`} id={`${id}-${s.key}-incomplete`} color={s.color} variant="hatched" horizontal={horizontal} />)}
            {glow && <GlowFilter id={`${id}-glow`} blur={5} strength={0.45} />}
            {background !== "none" && <ChartBackgroundDefs id={`${id}-bg`} variant={background} />}
          </defs>
          {background !== "none" && <ChartBackground id={`${id}-bg`} variant={background} />}
          <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke="var(--border)" strokeDasharray="" />
          {horizontal ? (
            <>
              <XAxis {...valueAxis} />
              <YAxis {...categoryAxis} width={104} interval={0} />
            </>
          ) : (
            <>
              <XAxis {...categoryAxis} />
              <YAxis {...valueAxis} width={Y_AXIS_WIDTH} />
            </>
          )}
          <Tooltip
            cursor={trace ? false : { fill: "var(--muted)", radius: 4 }}
            isAnimationActive={false}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltipCard
                  title={String(label)}
                  note={incompleteLast && payload[0]?.payload === data[lastIndex] ? "Devam ediyor" : undefined}
                  format={valueFormat}
                  rows={series
                    .filter((s) => activeSeries == null || s.key === activeSeries)
                    .map((s) => ({ key: s.key, label: s.label, color: s.color, value: payload.find((p) => p.dataKey === s.key)?.value as number | undefined }))}
                />
              ) : null
            }
          />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId={stacked ? "stack" : undefined}
              maxBarSize={MAX_BAR}
              isAnimationActive={false}
              shape={(props: BarShapeProps) => (
                <BarShape
                  {...props}
                  seriesKey={s.key}
                  seriesKeys={seriesKeys}
                  fill={variant === "solid" ? s.color : `url(#${id}-${s.key})`}
                  horizontal={horizontal}
                  stacked={stacked}
                  animate={!reduce}
                  incompleteFill={incompleteLast ? `url(#${id}-${s.key}-incomplete)` : undefined}
                  lastIndex={lastIndex}
                  glowFilter={glow ? `url(#${id}-glow)` : undefined}
                />
              )}
            />
          ))}
          {tracedValue != null && (
            <ReferenceLine
              {...(horizontal ? { x: tracedValue } : { y: tracedValue })}
              ifOverflow="extendDomain"
              shape={(p: { x1?: number; y1?: number; x2?: number; y2?: number }) => (
                <TraceLine {...p} value={tracedValue} horizontal={horizontal} format={axisFormat} />
              )}
            />
          )}
        </RechartsBarChart>
      </ChartContainer>
      </BarHoverContext.Provider>
    </div>
  )
}

export { BarChart, type BarChartProps, type BarChartVariant }
