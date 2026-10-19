import * as React from "react"

import { cn } from "@/lib/utils"

type SpinnerVariant =
  | "default"
  | "ring"
  | "spokes"
  | "comet"
  | "dual"
  | "dots"
  | "bounce"
  | "grid"
  | "bars"
  | "wave"
  | "ripple"
  | "ping"
  | "orbit"
  | "infinity"
  | "morph"
  | "cradle"

type SpinnerProps = React.ComponentProps<"svg"> & {
  /**
   * Indicator shape. Rotating: `default` (open arc), `ring`, `spokes`, `comet`, `dual`.
   * Dots: `dots`, `bounce`, `grid`. Bars: `bars`, `wave`. Pulse: `ripple`, `ping`, `orbit`.
   * Shapes: `infinity`, `morph`, `cradle`.
   */
  variant?: SpinnerVariant
}

/** Sets a part's index, which staggers its animation (see the spinner utilities in theme.css). */
const at = (i: number) => ({ "--i": i }) as React.CSSProperties

const INFINITY = "M12 12c-2-2.67-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.33 6-4c2-2.67 4-4 6-4a4 4 0 0 1 0 8c-2 0-4-1.33-6-4z"

/** The root class and the parts each variant draws in a 24×24 box, all in currentColor. */
const variants: Record<SpinnerVariant, { className?: string; parts?: React.ReactNode }> = {
  default: { className: "animate-spinner-spin", parts: <path d="M21 12a9 9 0 1 1-6.219-8.56" /> },
  ring: {
    className: "animate-spinner-spin",
    parts: (
      <>
        <circle cx="12" cy="12" r="9" opacity="0.18" />
        <path d="M12 3a9 9 0 0 1 9 9" />
      </>
    ),
  },
  spokes: {
    parts: Array.from({ length: 8 }, (_, i) => (
      <line key={i} x1="12" y1="2.5" x2="12" y2="6.5" transform={`rotate(${i * 45} 12 12)`} className="animate-spinner-fade" style={at(i)} />
    )),
  },
  comet: {
    className:
      "animate-spinner-spin rounded-full bg-[conic-gradient(from_0deg,transparent_12%,currentColor)] [mask-image:radial-gradient(farthest-side,transparent_80%,currentColor_82%)]",
  },
  dual: { className: "animate-spinner-dual", parts: <circle cx="12" cy="12" r="9" pathLength="100" strokeDasharray="25 25" /> },
  dots: {
    parts: [4, 12, 20].map((cx, i) => (
      <circle key={cx} cx={cx} cy="12" r="2.6" fill="currentColor" stroke="none" className="animate-spinner-pulse" style={at(i)} />
    )),
  },
  bounce: {
    parts: [4, 12, 20].map((cx, i) => (
      <circle key={cx} cx={cx} cy="13" r="2.4" fill="currentColor" stroke="none" className="animate-spinner-bounce" style={at(i)} />
    )),
  },
  grid: {
    parts: Array.from({ length: 9 }, (_, i) => (
      <rect
        key={i}
        x={2 + (i % 3) * 7.5}
        y={2 + Math.floor(i / 3) * 7.5}
        width="5"
        height="5"
        rx="1"
        fill="currentColor"
        stroke="none"
        className="animate-spinner-grid"
        style={at((i % 3) + Math.floor(i / 3))}
      />
    )),
  },
  bars: {
    parts: [3, 10, 17].map((x, i) => (
      <rect key={x} x={x} y="2" width="4" height="20" rx="2" fill="currentColor" stroke="none" className="animate-spinner-bars" style={at(i)} />
    )),
  },
  wave: {
    parts: Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={1.6 + i * 3.8} y="3" width="2.2" height="18" rx="1.1" fill="currentColor" stroke="none" className="animate-spinner-wave" style={at(i)} />
    )),
  },
  ripple: {
    parts: [0, 1].map((i) => <circle key={i} cx="12" cy="12" r="10" strokeWidth="1.8" className="animate-spinner-ripple" style={at(i)} />),
  },
  ping: {
    parts: (
      <>
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" className="animate-spinner-ping" />
      </>
    ),
  },
  orbit: {
    className: "animate-spinner-spin",
    parts: (
      <>
        <circle cx="12" cy="12" r="9" strokeWidth="1.2" opacity="0.18" />
        <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" opacity="0.35" />
        <circle cx="12" cy="3" r="2.6" fill="currentColor" stroke="none" />
      </>
    ),
  },
  infinity: {
    parts: (
      <>
        <path d={INFINITY} opacity="0.18" />
        <path d={INFINITY} pathLength="100" strokeDasharray="26 74" className="animate-spinner-trail" />
      </>
    ),
  },
  morph: { className: "animate-spinner-morph bg-current" },
  // The end balls swing a little past the box, like a real cradle.
  cradle: {
    className: "overflow-visible",
    parts: [5.4, 9.8, 14.2, 18.6].map((cx, i, all) => (
      <circle
        key={cx}
        cx={cx}
        cy="18"
        r="2.2"
        fill="currentColor"
        stroke="none"
        className={cn(i === 0 && "animate-spinner-swing-start", i === all.length - 1 && "animate-spinner-swing-end")}
        style={{ transformBox: "view-box", transformOrigin: `${cx}px 3px` }}
      />
    )),
  },
}

function Spinner({ variant = "default", className, ...props }: SpinnerProps) {
  const { className: variantClassName, parts } = variants[variant]
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      data-slot="spinner"
      data-variant={variant}
      role="status"
      aria-label="Yükleniyor"
      className={cn("size-4", variantClassName, className)}
      {...props}
    >
      {parts}
    </svg>
  )
}

export { Spinner, type SpinnerProps, type SpinnerVariant }
