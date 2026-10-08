"use client"

import * as React from "react"
import { animate, motion, useReducedMotion } from "motion/react"

import { EASE_OUT, ICON_SPRING, INSTANT } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { CHART_COLORS, defaultNumberFormat } from "@/components/ikas/chart-kit"

type DonutDatum = {
  key: string
  label: string
  value: number
  /** Override the slot color. Defaults to the categorical order. */
  color?: string
}

type DonutChartProps = {
  data: DonutDatum[]
  /** Formats values in the center and the legend. */
  valueFormat?: (value: number) => string
  /** Caption under the total, e.g. "Toplam satış". */
  centerLabel?: React.ReactNode
  /** Diameter of the ring in px. */
  height?: number
  /** Slices after this many fold into "Diğer". */
  maxSlices?: number
  className?: string
}

/** Fold the tail into "Diğer" so the ring never shows more than `max` slices. */
function foldSlices(data: DonutDatum[], max: number) {
  if (data.length <= max) return data
  const head = data.slice(0, max - 1)
  const rest = data.slice(max - 1).reduce((sum, d) => sum + d.value, 0)
  return [...head, { key: "__other", label: "Diğer", value: rest, color: "var(--icon)" }]
}

/** Annular sector path. Angles in radians, 0 = 12 o'clock, clockwise. */
function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number) {
  const sweep = Math.min(end - start, Math.PI * 2 - 0.0001)
  const e = start + sweep
  const large = sweep > Math.PI ? 1 : 0
  const p = (r: number, a: number) => `${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`
  return `M ${p(outer, start)} A ${outer} ${outer} 0 ${large} 1 ${p(outer, e)} L ${p(inner, e)} A ${inner} ${inner} 0 ${large} 0 ${p(inner, start)} Z`
}

/**
 * Part-to-whole for a handful of categories. The total sits in the middle and
 * switches to the hovered slice; the legend lists values and shares so the
 * chart never relies on color alone.
 */
function DonutChart({ data, valueFormat = defaultNumberFormat, centerLabel = "Toplam", height = 220, maxSlices = 6, className }: DonutChartProps) {
  const reduce = useReducedMotion()
  const slices = React.useMemo(
    () => foldSlices(data, maxSlices).map((d, i) => ({ ...d, color: d.color ?? CHART_COLORS[i % CHART_COLORS.length] })),
    [data, maxSlices]
  )
  const total = slices.reduce((sum, d) => sum + d.value, 0)
  const [active, setActive] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)

  // Sweep the ring in once on mount; slices grow clockwise in lockstep.
  React.useEffect(() => {
    if (reduce) return
    const controls = animate(0, 1, { duration: 0.9, ease: EASE_OUT, onUpdate: setProgress })
    return () => controls.stop()
  }, [reduce])

  const size = height
  const c = size / 2
  const outer = c - 6
  const inner = outer * 0.68
  const activeSlice = slices.find((s) => s.key === active)

  // Reduced motion (which can resolve after mount) shows the full ring at once.
  const shown = reduce ? 1 : progress
  const arcs = slices.map((s, i) => {
    const before = slices.slice(0, i).reduce((sum, d) => sum + d.value, 0)
    const share = total ? s.value / total : 0
    const from = total ? before / total : 0
    return { ...s, share, start: from * Math.PI * 2 * shown, end: (from + share) * Math.PI * 2 * shown }
  })

  return (
    // Container query, not viewport: in a narrow aside the legend moves below the ring.
    <div data-slot="donut-chart" className={cn("@container w-full", className)}>
      <div className="flex flex-col items-center gap-5 @md:flex-row @md:gap-8">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${String(centerLabel)}: ${valueFormat(total)}`}>
          {arcs.map((a) => (
            <motion.path
              key={a.key}
              d={arcPath(c, c, inner, outer, a.start, a.end)}
              fill={a.color}
              stroke="var(--card)"
              strokeWidth={2}
              strokeLinejoin="round"
              onPointerEnter={() => setActive(a.key)}
              onPointerLeave={() => setActive(null)}
              animate={{ scale: active === a.key ? 1.035 : 1, opacity: active && active !== a.key ? 0.35 : 1 }}
              transition={reduce ? INSTANT : ICON_SPRING}
              style={{ transformBox: "view-box", transformOrigin: "center" }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <AnimatedNumber value={activeSlice ? activeSlice.value : total} format={valueFormat} className="text-xl font-semibold tracking-[-0.02em]" />
          <span className="max-w-[60%] truncate text-[12px] text-muted-foreground">{activeSlice ? activeSlice.label : centerLabel}</span>
        </div>
      </div>

      <ul aria-label="Dağılım" className="flex w-full min-w-0 flex-col gap-0.5 @md:max-w-72">
        {arcs.map((a) => (
          <li key={a.key}>
            <div
              tabIndex={0}
              onPointerEnter={() => setActive(a.key)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(a.key)}
              onBlur={() => setActive(null)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-[background-color,opacity] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                active === a.key && "bg-muted",
                active && active !== a.key && "opacity-55"
              )}
            >
              <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: a.color }} />
              <span className="min-w-0 flex-1 truncate text-foreground">{a.label}</span>
              <span className="font-medium text-foreground tabular-nums">{valueFormat(a.value)}</span>
              <span className="w-11 text-right text-muted-foreground tabular-nums">%{(a.share * 100).toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}

export { DonutChart, type DonutChartProps, type DonutDatum }
