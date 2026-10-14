"use client"

import * as React from "react"
import { AnimatePresence, Reorder, animate, motion, useMotionValue, usePresence, useTransform } from "motion/react"
import { CheckIcon, PipetteIcon, PlusIcon } from "lucide-react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { EASE_IN_OUT, EASE_OUT, FADE_OUT, INSTANT, SPRING } from "@/lib/motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { CopyIconButton } from "@/components/ikas/animated-check"

type ColorFormat = "hex" | "rgb" | "hsl" | "oklch"

type ColorPickerProps = {
  /** Selected color. Reads hex, rgb(), hsl() and oklch(); leave undefined with defaultValue for an uncontrolled picker. */
  value?: string
  /** Initial color when uncontrolled. */
  defaultValue?: string
  /** Called with the color as #RRGGBB, or #RRGGBBAA when it is not opaque. */
  onValueChange?: (hex: string) => void
  /** Format the text field opens in; the format button cycles through the rest. */
  defaultFormat?: ColorFormat
  /** Shows the opacity slider. Without it every color stays opaque. */
  alpha?: boolean
  /** Background the color will sit on. Shows the WCAG contrast readout when set. */
  contrastWith?: string
  /** Saved colors, newest first. Leave undefined with defaultSwatches to let the picker keep them. */
  swatches?: string[]
  /** Initial saved colors when uncontrolled. */
  defaultSwatches?: string[]
  /** Called when a color is saved, removed or moved. */
  onSwatchesChange?: (swatches: string[]) => void
  /** Most saved colors. Saving past it drops the oldest. */
  maxSwatches?: number
  /** Name of the color, for the panel heading and accessible names. */
  label?: string
  /** Blocks the trigger. */
  disabled?: boolean
  /** Id of the trigger, for a FieldLabel htmlFor. */
  id?: string
  /** Marks the trigger invalid, for form errors. */
  "aria-invalid"?: boolean
  /** Panel alignment against the trigger. */
  align?: "start" | "center" | "end"
  /** Classes for the trigger. */
  className?: string
}

/* ---------- Color math: sRGB channels and alpha run 0 to 1, hue in degrees. ---------- */

type Hsv = { h: number; s: number; v: number; a: number }
type Rgb = { r: number; g: number; b: number; a: number }

const unit = (n: number) => Math.min(1, Math.max(0, n))
const fixed = (n: number, digits: number) => Number(n.toFixed(digits))

/** Picks the RGB triple for a hue sector, given chroma and the second-largest component. */
function sector(h: number, c: number, x: number): [number, number, number] {
  const i = Math.floor((((h % 360) + 360) % 360) / 60)
  return ([[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]] as const)[i] as [number, number, number]
}

function fromHsv({ h, s, v, a }: Hsv): Rgb {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const [r, g, b] = sector(h, c, x)
  const m = v - c
  return { r: r + m, g: g + m, b: b + m, a }
}

/** Hue of an RGB color, or `fallback` for greys, where hue is undefined. */
function hueOf({ r, g, b }: Rgb, fallback: number) {
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  if (delta < 1e-6) return fallback
  const h = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return (h * 60 + 360) % 360
}

function toHsv(rgb: Rgb, fallbackHue: number): Hsv {
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const delta = max - Math.min(rgb.r, rgb.g, rgb.b)
  return { h: hueOf(rgb, fallbackHue), s: max === 0 ? 0 : delta / max, v: max, a: rgb.a }
}

function fromHsl(h: number, s: number, l: number, a: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const [r, g, b] = sector(h, c, x)
  const m = l - c / 2
  return { r: r + m, g: g + m, b: b + m, a }
}

function toHsl(rgb: Rgb, fallbackHue: number) {
  const max = Math.max(rgb.r, rgb.g, rgb.b)
  const min = Math.min(rgb.r, rgb.g, rgb.b)
  const l = (max + min) / 2
  const delta = max - min
  return { h: hueOf(rgb, fallbackHue), s: delta < 1e-6 ? 0 : delta / (1 - Math.abs(2 * l - 1)), l }
}

/** sRGB transfer curve. */
const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const gamma = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)

/** OKLab matrices from Björn Ottosson's reference implementation. */
function toOklch(rgb: Rgb, fallbackHue: number) {
  const [r, g, b] = [linear(rgb.r), linear(rgb.g), linear(rgb.b)]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B)
  return { l: L, c: C, h: C < 0.0005 ? fallbackHue : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 }
}

function fromOklch(L: number, C: number, H: number, alpha: number): Rgb {
  const rad = (H * Math.PI) / 180
  const A = C * Math.cos(rad)
  const B = C * Math.sin(rad)
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return {
    r: unit(gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    g: unit(gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    b: unit(gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
    a: alpha,
  }
}

const to255 = (c: number) => Math.round(unit(c) * 255)
const hexPair = (c: number) => to255(c).toString(16).padStart(2, "0").toUpperCase()
const opaque = (a: number) => a > 0.999

function toHex(hsv: Hsv) {
  const { r, g, b, a } = fromHsv(hsv)
  return `#${hexPair(r)}${hexPair(g)}${hexPair(b)}${opaque(a) ? "" : hexPair(a)}`
}

function formatAs(hsv: Hsv, format: ColorFormat) {
  if (format === "hex") return toHex(hsv)
  const rgb = fromHsv(hsv)
  const alpha = opaque(hsv.a) ? "" : ` / ${Math.round(hsv.a * 100)}%`
  if (format === "rgb") return `rgb(${to255(rgb.r)} ${to255(rgb.g)} ${to255(rgb.b)}${alpha})`
  if (format === "hsl") {
    const { h, s, l } = toHsl(rgb, hsv.h)
    return `hsl(${Math.round(h) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${alpha})`
  }
  const { l, c, h } = toOklch(rgb, hsv.h)
  return `oklch(${fixed(l * 100, 1)}% ${fixed(c, 3)} ${fixed(h, 1) % 360}${alpha})`
}

/** One CSS number: `50%` becomes `percentOf / 2`, a bare number stays as is. */
function amount(token: string | undefined, percentOf: number) {
  if (token === undefined) return NaN
  const n = parseFloat(token)
  return token.endsWith("%") ? (n / 100) * percentOf : n
}

/** Reads #rgb, #rgba, #rrggbb, #rrggbbaa and rgb(), hsl(), oklch() in space or comma syntax. Null when unreadable. */
function parse(input: string, fallbackHue = 0): Hsv | null {
  const text = input.trim().toLowerCase()
  const hex = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text)?.[1]
  if (hex) {
    const full = hex.length <= 4 ? [...hex].map((d) => d + d).join("") : hex
    const pair = (i: number) => parseInt(full.slice(i * 2, i * 2 + 2), 16) / 255
    return toHsv({ r: pair(0), g: pair(1), b: pair(2), a: full.length === 8 ? pair(3) : 1 }, fallbackHue)
  }
  const call = /^(rgba?|hsla?|oklch)\((.+)\)$/.exec(text)
  if (!call) return null
  const parts = call[2].replace(/deg/g, "").split(/[\s,/]+/).filter(Boolean)
  if (parts.length < 3 || parts.length > 4) return null
  const alpha = parts[3] === undefined ? 1 : unit(amount(parts[3], 1))
  let rgb: Rgb
  let hue = fallbackHue
  if (call[1].startsWith("rgb")) {
    rgb = { r: unit(amount(parts[0], 255) / 255), g: unit(amount(parts[1], 255) / 255), b: unit(amount(parts[2], 255) / 255), a: alpha }
  } else if (call[1].startsWith("hsl")) {
    hue = ((parseFloat(parts[0]) % 360) + 360) % 360
    const pct = (t: string) => unit(parseFloat(t) / 100)
    rgb = fromHsl(hue, pct(parts[1]), pct(parts[2]), alpha)
  } else {
    const L = parts[0].endsWith("%") ? parseFloat(parts[0]) / 100 : parseFloat(parts[0])
    // CSS Color 4: 100% chroma is 0.4.
    rgb = fromOklch(unit(L), amount(parts[1], 0.4), parseFloat(parts[2]), alpha)
  }
  if ([rgb.r, rgb.g, rgb.b, rgb.a].some(Number.isNaN)) return null
  const hsv = toHsv(rgb, hue)
  return call[1].startsWith("hsl") ? { ...hsv, h: hue } : hsv
}

/** WCAG 2 contrast of the color, laid over the background, against that background. */
function contrastRatio(color: Hsv, background: Hsv) {
  const fg = fromHsv(color)
  const bg = fromHsv({ ...background, a: 1 })
  const over = (c: number, base: number) => c * fg.a + base * (1 - fg.a)
  const luminance = (r: number, g: number, b: number) => 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
  const top = luminance(over(fg.r, bg.r), over(fg.g, bg.g), over(fg.b, bg.b))
  const base = luminance(bg.r, bg.g, bg.b)
  return (Math.max(top, base) + 0.05) / (Math.min(top, base) + 0.05)
}

function grade(ratio: number) {
  if (ratio >= 7) return { label: "AAA", status: "success", spoken: "AAA seviyesini geçiyor" } as const
  if (ratio >= 4.5) return { label: "AA", status: "success", spoken: "AA seviyesini geçiyor" } as const
  if (ratio >= 3) return { label: "AA büyük", status: "warning", spoken: "yalnızca büyük metin için AA" } as const
  return { label: "Yetersiz", status: "danger", spoken: "kontrast yetersiz" } as const
}

/* ---------- Interaction helpers ---------- */

const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl", "oklch"]
const FORMAT_NAMES: Record<ColorFormat, string> = { hex: "HEX", rgb: "RGB", hsl: "HSL", oklch: "OKLCH" }
const FALLBACK: Hsv = { h: 220, s: 0.8, v: 0.95, a: 1 }
/** Thumb radius in px. Track gradients start and end this far in, so the color under a thumb is the value it reports. */
const THUMB = 8
const CHECKER = "repeating-conic-gradient(var(--muted) 0 25%, var(--card) 0 50%) 0 0 / 8px 8px"
const reducedQuery = "(prefers-reduced-motion: reduce)"

function useReducedMotion() {
  return React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(reducedQuery)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia(reducedQuery).matches,
    () => false
  )
}

type EyeDropperApi = new () => { open: () => Promise<{ sRGBHex: string }> }
const noSubscribe = () => () => {}
/** True where the browser can pick a color from the screen. False during SSR and the first render. */
function useEyeDropper() {
  return React.useSyncExternalStore(noSubscribe, () => "EyeDropper" in window, () => false)
}

/**
 * Pointer tracking over a box. `pressed` is true while the button is down and
 * `dragging` once the pointer has moved: a click glides the thumb on the spring,
 * a drag keeps it under the pointer.
 */
function usePointerBox(box: React.RefObject<HTMLElement | null>, onPoint: (x: number, y: number) => void) {
  const [pressed, setPressed] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const pointer = React.useRef<number | null>(null)

  function read(event: React.PointerEvent) {
    const rect = (box.current ?? (event.currentTarget as HTMLElement)).getBoundingClientRect()
    onPoint(unit((event.clientX - rect.left) / rect.width), unit((event.clientY - rect.top) / rect.height))
  }
  function release(event: React.PointerEvent) {
    if (event.pointerId !== pointer.current) return
    pointer.current = null
    setPressed(false)
    setDragging(false)
  }

  return {
    pressed,
    dragging,
    handlers: {
      onPointerDown(event: React.PointerEvent<HTMLElement>) {
        if (event.button !== 0 || pointer.current !== null) return
        pointer.current = event.pointerId
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {}
        setPressed(true)
        read(event)
      },
      onPointerMove(event: React.PointerEvent<HTMLElement>) {
        if (event.pointerId !== pointer.current) return
        setDragging(true)
        read(event)
      },
      onPointerUp: release,
      onPointerCancel: release,
    },
  }
}

/** A motion value that glides to `target` on SPRING, or jumps while glued to the pointer or under reduced motion. */
function useGlide(target: number, glued: boolean, reduce: boolean) {
  const value = useMotionValue(target)
  React.useEffect(() => {
    if (glued || reduce) {
      value.jump(target)
      return
    }
    const controls = animate(value, target, SPRING)
    return () => controls.stop()
  }, [glued, reduce, target, value])
  return value
}

const percent = (n: number) => `${n * 100}%`

/** Arrow keys step 1, Shift or Page keys step 10. Returns [dx, dy] with up as +y, or null for other keys. */
function arrowStep(event: React.KeyboardEvent): [number, number] | null {
  const n = event.shiftKey || event.key.startsWith("Page") ? 10 : 1
  switch (event.key) {
    case "ArrowRight":
      return [n, 0]
    case "ArrowLeft":
      return [-n, 0]
    case "ArrowUp":
    case "PageUp":
      return [0, n]
    case "ArrowDown":
    case "PageDown":
      return [0, -n]
  }
  return null
}

/** A rounded chip over a checkerboard, so opacity reads as opacity. */
function Chip({ color, className }: { color: string; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative block shrink-0 overflow-hidden", className)} style={{ background: CHECKER }}>
      <span className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_var(--shade-border)]" style={{ background: color }} />
    </span>
  )
}

/** Text that slides up when it changes, the way AnimatedNumber rolls. */
function Slide({ children, reduce, className }: { children: string; reduce: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={children}
          initial={reduce ? { opacity: 0 } : { y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0, transition: INSTANT } : { y: -10, opacity: 0, transition: FADE_OUT }}
          transition={reduce ? INSTANT : SPRING}
          className="inline-block whitespace-nowrap"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

type TrackProps = {
  label: string
  value: number
  max: number
  valueText: string
  background: string
  thumbColor: string
  reduce: boolean
  onChange: (value: number) => void
}

/** Horizontal slider for hue and opacity. */
function Track({ label, value, max, valueText, background, thumbColor, reduce, onChange }: TrackProps) {
  const rail = React.useRef<HTMLDivElement>(null)
  const { pressed, dragging, handlers } = usePointerBox(rail, (x) => onChange(x * max))
  const x = useGlide(value / max, dragging, reduce)
  const left = useTransform(x, percent)

  return (
    <div
      data-slot="color-picker-track"
      className="relative h-3 cursor-pointer touch-none rounded-full shadow-[inset_0_0_0_1px_var(--shade-border)]"
      style={{ background }}
      {...handlers}
    >
      <div ref={rail} className="absolute inset-y-0" style={{ insetInline: THUMB }}>
        <motion.div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.round(value)}
          aria-valuetext={valueText}
          animate={{ scale: pressed ? 1.15 : 1 }}
          transition={reduce ? INSTANT : SPRING}
          className="absolute top-1/2 size-4 -translate-1/2 cursor-grab rounded-full shadow-thumb ring-2 ring-white outline-none focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring/50 active:cursor-grabbing"
          style={{ left, background: `linear-gradient(${thumbColor}, ${thumbColor}), ${CHECKER}` }}
          onKeyDown={(event) => {
            if (event.key === "Home" || event.key === "End") {
              event.preventDefault()
              onChange(event.key === "Home" ? 0 : max)
              return
            }
            const step = arrowStep(event)
            if (!step) return
            event.preventDefault()
            onChange(Math.min(max, Math.max(0, value + (step[0] || step[1]))))
          }}
        />
      </div>
    </div>
  )
}

type GrowPanelProps = React.ComponentProps<"div"> & {
  /** Box and corner radius of the trigger the panel grows out of. */
  from: { width: number; height: number; radius: number }
  reduce: boolean
  /** Called once the fold back into the trigger has finished, right before unmount. */
  onFolded: () => void
}

/**
 * The panel opens over its trigger and grows out of the trigger's box on SPRING,
 * from whichever corner it is anchored to; on close it folds back on EASE_OUT and
 * only then unmounts. At rest size it is an exact copy of the trigger (box and
 * corner radius), so the two hand off without a seam. Its drop shadow follows the
 * clipped shape.
 */
function GrowPanel({ from, reduce, onFolded, children, className, style, ref, ...props }: GrowPanelProps) {
  const [isPresent, safeToRemove] = usePresence()
  const node = React.useRef<HTMLDivElement | null>(null)
  const box = React.useRef({ width: from.width, height: from.height })
  const progress = useMotionValue(reduce ? 1 : 0)

  React.useLayoutEffect(() => {
    const el = node.current
    if (!el) return
    const measure = () => (box.current = { width: el.offsetWidth, height: el.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (isPresent) {
      if (reduce) return progress.jump(1)
      const controls = animate(progress, 1, SPRING)
      return () => controls.stop()
    }
    const done = () => {
      onFolded()
      safeToRemove()
    }
    if (reduce) return done()
    const controls = animate(progress, 0, { duration: 0.18, ease: EASE_OUT })
    controls.then(done)
    return () => controls.stop()
  }, [isPresent, onFolded, progress, reduce, safeToRemove])

  const clipPath = useTransform(() => {
    const q = progress.get()
    const dx = Math.max(0, box.current.width - from.width) * (1 - q)
    const dy = Math.max(0, box.current.height - from.height) * (1 - q)
    // Radix writes the side and alignment it settled on, so the fold always starts at the trigger's corner.
    const top = node.current?.dataset.side === "top"
    const end = node.current?.dataset.align === "end"
    // Corners grow with the box, from the trigger's rounded-lg to the panel's rounded-xl (1.4×, as in the theme).
    return `inset(${top ? dy : 0}px ${end ? 0 : dx}px ${top ? 0 : dy}px ${end ? dx : 0}px round ${from.radius * (1 + 0.4 * q)}px)`
  })

  return (
    <motion.div
      ref={(el: HTMLDivElement | null) => {
        node.current = el
        if (typeof ref === "function") ref(el)
        else if (ref) ref.current = el
      }}
      data-closing={!isPresent || undefined}
      className="z-50 outline-hidden data-closing:pointer-events-none"
      style={{ ...style, width: Math.max(288, from.width), filter: "drop-shadow(0 12px 24px var(--shade-3)) drop-shadow(0 2px 6px var(--shade-2))" }}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      <motion.div
        className={cn("rounded-xl bg-popover text-sm text-popover-foreground shadow-[inset_0_0_0_1px_var(--shade-border)]", className)}
        style={{ clipPath }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ---------- ColorPicker ---------- */

/** A color field that opens a picker: saturation and brightness area, hue and opacity, four text formats, eyedropper, contrast and saved colors. */
function ColorPicker({
  value,
  defaultValue = "#3B6FE0",
  onValueChange,
  defaultFormat = "hex",
  alpha = true,
  contrastWith,
  swatches: swatchesProp,
  defaultSwatches = [],
  onSwatchesChange,
  maxSwatches = 7,
  label = "Renk",
  disabled = false,
  id,
  "aria-invalid": ariaInvalid,
  align = "start",
  className,
}: ColorPickerProps) {
  const uid = React.useId()
  const reduce = useReducedMotion()
  const canPick = useEyeDropper()

  const [hsv, setHsv] = React.useState<Hsv>(() => parse(value ?? defaultValue) ?? FALLBACK)
  // Follow a controlled value during render; keep the current hue when the new color is grey.
  const [seen, setSeen] = React.useState(value)
  if (value !== undefined && value !== seen) {
    setSeen(value)
    const next = parse(value, hsv.h)
    if (next && toHex(next) !== toHex(hsv)) setHsv(next)
  }
  const [ownSwatches, setOwnSwatches] = React.useState(defaultSwatches)
  const swatches = swatchesProp ?? ownSwatches

  const [open, setOpen] = React.useState(false)
  const [triggerBox, setTriggerBox] = React.useState({ width: 192, height: 36, radius: 10 })
  // True from the moment the panel opens over the trigger until it has folded back into it; the trigger hides meanwhile.
  const [covered, setCovered] = React.useState(false)
  const onFolded = React.useCallback(() => setCovered(false), [])
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [format, setFormat] = React.useState(defaultFormat)
  const [draft, setDraft] = React.useState<string | null>(null)
  const [invalid, setInvalid] = React.useState(false)
  const [rovingSwatch, setRovingSwatch] = React.useState<string | null>(null)

  const areaRef = React.useRef<HTMLDivElement>(null)
  const areaThumb = React.useRef<HTMLDivElement>(null)
  const addRef = React.useRef<HTMLButtonElement>(null)
  const swatchRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const draggedSwatch = React.useRef(false)
  const shake = useMotionValue(0)
  // Each focus of the text field sends one highlight around its border.
  const [lap, setLap] = React.useState(0)

  const hex = toHex(hsv)
  const rgb = fromHsv(hsv)
  const solid = `rgb(${to255(rgb.r)} ${to255(rgb.g)} ${to255(rgb.b)})`
  const css = `rgb(${to255(rgb.r)} ${to255(rgb.g)} ${to255(rgb.b)} / ${fixed(hsv.a, 3)})`
  const pureHue = `hsl(${fixed(hsv.h, 1)} 100% 50%)`
  const text = formatAs(hsv, format)
  const backdrop = contrastWith ? parse(contrastWith) : null
  const ratio = backdrop ? contrastRatio(hsv, backdrop) : 0
  const level = grade(ratio)

  function commit(next: Hsv) {
    const color = alpha ? next : { ...next, a: 1 }
    setHsv(color)
    if (toHex(color) !== hex) onValueChange?.(toHex(color))
  }
  function setSwatches(next: string[]) {
    if (swatchesProp === undefined) setOwnSwatches(next)
    onSwatchesChange?.(next)
  }

  const area = usePointerBox(areaRef, (x, y) => commit({ ...hsv, s: x, v: 1 - y }))
  const areaX = useGlide(hsv.s, area.dragging, reduce)
  const areaY = useGlide(1 - hsv.v, area.dragging, reduce)
  const areaLeft = useTransform(areaX, percent)
  const areaTop = useTransform(areaY, percent)

  function cycleFormat() {
    setFormat(FORMATS[(FORMATS.indexOf(format) + 1) % FORMATS.length])
    setDraft(null)
    setInvalid(false)
  }

  /** Applies the typed text. False when it cannot be read. */
  function applyDraft() {
    if (draft === null) return true
    const next = parse(draft, hsv.h)
    if (!next) {
      setInvalid(true)
      if (!reduce && !window.matchMedia(reducedQuery).matches) animate(shake, [0, -6, 5, -3, 0], { duration: 0.3, ease: EASE_OUT })
      return false
    }
    commit(next)
    setDraft(null)
    setInvalid(false)
    return true
  }

  function pickFromScreen() {
    const Api = (window as unknown as { EyeDropper?: EyeDropperApi }).EyeDropper
    if (!Api) return
    new Api()
      .open()
      .then(({ sRGBHex }) => {
        const next = parse(sRGBHex, hsv.h)
        if (next) commit({ ...next, a: hsv.a })
      })
      .catch(() => {})
  }

  function saveColor() {
    // Saving a color already in the list moves it to the front instead of adding a copy.
    setSwatches([hex, ...swatches.filter((c) => c !== hex)].slice(0, maxSwatches))
    setRovingSwatch(hex)
  }

  function focusSwatch(color: string | undefined) {
    requestAnimationFrame(() => (color ? swatchRefs.current.get(color)?.focus({ preventScroll: true }) : addRef.current?.focus({ preventScroll: true })))
  }

  function onSwatchKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const color = swatches[index]
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault()
      const next = swatches.filter((c) => c !== color)
      const neighbor = next[Math.min(index, next.length - 1)]
      setSwatches(next)
      setRovingSwatch(neighbor ?? null)
      focusSwatch(neighbor)
      return
    }
    const dir = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (dir && event.altKey) {
      event.preventDefault()
      const to = index + dir
      if (to < 0 || to >= swatches.length) return
      const next = [...swatches]
      next.splice(index, 1)
      next.splice(to, 0, color)
      setSwatches(next)
      focusSwatch(color)
      return
    }
    if (!dir && event.key !== "Home" && event.key !== "End") return
    event.preventDefault()
    const target = event.key === "Home" ? 0 : event.key === "End" ? swatches.length - 1 : (index + dir + swatches.length) % swatches.length
    setRovingSwatch(swatches[target])
    swatchRefs.current.get(swatches[target])?.focus({ preventScroll: true })
  }

  const tabSwatch = rovingSwatch && swatches.includes(rovingSwatch) ? rovingSwatch : swatches[0]
  const hueTrack = `linear-gradient(to right, ${[0, 60, 120, 180, 240, 300, 360].map((h) => `hsl(${h} 100% 50%) calc(${THUMB}px + (100% - ${THUMB * 2}px) * ${h / 360})`).join(", ")})`
  const alphaTrack = `linear-gradient(to right, transparent ${THUMB}px, ${solid} calc(100% - ${THUMB}px)), ${CHECKER}`

  const header = (
    <div className="flex h-9 items-center gap-2 pr-1.5 pl-3.5">
      <Chip color={css} className="size-5 rounded-md" />
      <span className="min-w-0 truncate font-mono text-[13px] tabular-nums">{hex}</span>
      <CopyIconButton value={hex} label="Hex kodunu kopyala" size="icon-xs" className="mr-auto" />
      {canPick && (
        <Button variant="ghost" size="icon-xs" aria-label="Ekrandan renk seç" onClick={pickFromScreen}>
          <PipetteIcon data-anim="pop" />
        </Button>
      )}
      <PopoverPrimitive.Close asChild>
        <Button variant="ghost" size="icon-xs" aria-label="Bitti">
          <CheckIcon data-anim="pop" />
        </Button>
      </PopoverPrimitive.Close>
    </div>
  )
  // Body sections enter one after another on the theme's panel-enter (--stagger), right behind the growing edge.

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        const el = triggerRef.current
        if (next && el) {
          setTriggerBox({ width: el.offsetWidth, height: el.offsetHeight, radius: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 })
          setCovered(true)
        }
        setOpen(next)
        if (!next) {
          setDraft(null)
          setInvalid(false)
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          ref={triggerRef}
          id={id}
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-slot="color-picker-trigger"
          data-covered={covered || undefined}
          className={cn("w-full justify-start font-normal aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-covered:opacity-0 sm:w-48", className)}
        >
          <Chip color={css} className="size-5 rounded-md" />
          <span className="truncate font-mono text-[13px] tabular-nums">{hex}</span>
        </Button>
      </PopoverPrimitive.Trigger>
      <AnimatePresence>
        {open && (
          <PopoverPrimitive.Portal key="panel" forceMount>
            <PopoverPrimitive.Content
              forceMount
              asChild
              side="bottom"
              align={align}
              sideOffset={-triggerBox.height}
              collisionPadding={8}
              aria-label={label}
              onOpenAutoFocus={(event) => {
                event.preventDefault()
                areaThumb.current?.focus({ preventScroll: true })
              }}
              onEscapeKeyDown={(event) => {
                // Escape first drops a typed draft; the next one closes the panel.
                if (draft === null) return
                event.preventDefault()
                setDraft(null)
                setInvalid(false)
              }}
            >
              <GrowPanel data-slot="color-picker" from={triggerBox} reduce={reduce} onFolded={onFolded}>
                {header}
                <div className="grid gap-3 px-3 pt-1 pb-3">
                <div
                  ref={areaRef}
                  data-slot="color-picker-area"
                  className="relative h-36 animate-panel-enter cursor-crosshair touch-none rounded-lg shadow-[inset_0_0_0_1px_var(--shade-border)] [--stagger:0.6]"
                  style={{ background: `linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent), ${pureHue}` }}
                  {...area.handlers}
                >
                  <motion.div
                    ref={areaThumb}
                    role="slider"
                    tabIndex={0}
                    aria-roledescription="2 boyutlu kaydırıcı"
                    aria-label="Doygunluk ve parlaklık"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(hsv.s * 100)}
                    aria-valuetext={`Doygunluk %${Math.round(hsv.s * 100)}, parlaklık %${Math.round(hsv.v * 100)}`}
                    animate={{ scale: area.pressed ? 1.15 : 1 }}
                    transition={reduce ? INSTANT : SPRING}
                    className="absolute size-4 -translate-1/2 cursor-grab rounded-full shadow-thumb ring-2 ring-white outline-none focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring/50 active:cursor-grabbing"
                    style={{ left: areaLeft, top: areaTop, background: solid }}
                    onKeyDown={(event) => {
                      const step = arrowStep(event)
                      if (!step) return
                      event.preventDefault()
                      commit({ ...hsv, s: unit(hsv.s + step[0] / 100), v: unit(hsv.v + step[1] / 100) })
                    }}
                  />
                </div>

                <div className="grid animate-panel-enter gap-2.5 [--stagger:1.2]">
                  <Track
                    label="Ton"
                    value={hsv.h}
                    max={360}
                    valueText={`${Math.round(hsv.h)} derece`}
                    background={hueTrack}
                    thumbColor={pureHue}
                    reduce={reduce}
                    onChange={(h) => commit({ ...hsv, h: Math.min(h, 359.9) })}
                  />
                  {alpha && (
                    <Track
                      label="Opaklık"
                      value={hsv.a * 100}
                      max={100}
                      valueText={`%${Math.round(hsv.a * 100)}`}
                      background={alphaTrack}
                      thumbColor={css}
                      reduce={reduce}
                      onChange={(a) => commit({ ...hsv, a: unit(a / 100) })}
                    />
                  )}
                </div>

                <div className="grid animate-panel-enter gap-1 [--stagger:1.8]">
                  <motion.div
                    style={{
                      x: shake,
                      // The field wears the picked color; a little foreground keeps near-white colors visible on the panel.
                      "--field-edge": `color-mix(in oklab, ${solid} 82%, var(--foreground))`,
                      "--field-ring": `color-mix(in oklab, ${solid} 24%, transparent)`,
                    } as React.ComponentProps<typeof motion.div>["style"]}
                    className="relative"
                  >
                    <InputGroup className="border-(--field-edge) transition-[border-color,box-shadow] duration-200 ease-out hover:border-(--field-edge) has-[[data-slot=input-group-control]:focus-visible]:border-(--field-edge) has-[[data-slot=input-group-control]:focus-visible]:ring-(--field-ring)">
                      <InputGroupAddon className="ml-0 self-stretch border-r border-(--field-edge) py-0 pl-0 has-[>button]:ml-0">
                        <InputGroupButton
                          onClick={cycleFormat}
                          aria-label={`Biçim: ${FORMAT_NAMES[format]}. Değiştir`}
                          className="h-full w-16 justify-center rounded-none rounded-l-[calc(var(--radius-lg)-1px)] font-mono text-[11px] text-foreground"
                        >
                          <Slide reduce={reduce}>{FORMAT_NAMES[format]}</Slide>
                        </InputGroupButton>
                      </InputGroupAddon>
                      <div className="relative flex h-full min-w-0 flex-1 overflow-hidden">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.div
                            key={format}
                            initial={reduce ? { opacity: 0 } : { y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={reduce ? { opacity: 0, transition: INSTANT } : { y: -12, opacity: 0, transition: FADE_OUT }}
                            // A beat behind the format label, so the two read as one motion.
                            transition={reduce ? INSTANT : { ...SPRING, delay: 0.04 }}
                            className="flex min-w-0 flex-1"
                          >
                            <InputGroupInput
                              value={draft ?? text}
                              spellCheck={false}
                              autoComplete="off"
                              aria-label={`${label}, ${FORMAT_NAMES[format]}`}
                              aria-invalid={invalid || undefined}
                              aria-describedby={invalid ? `${uid}-error` : undefined}
                              className="h-full pl-2.5 font-mono text-[13px] tabular-nums md:text-[13px]"
                              onChange={(event) => {
                                setDraft(event.target.value)
                                setInvalid(false)
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== "Enter") return
                                event.preventDefault()
                                if (applyDraft()) event.currentTarget.select()
                              }}
                              onFocus={() => {
                                if (!reduce) setLap((n) => n + 1)
                              }}
                              onBlur={() => {
                                if (!applyDraft()) {
                                  setDraft(null)
                                  setInvalid(false)
                                }
                              }}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      </InputGroup>
                      {/* One lap of light around the border: a conic wedge spins inside a 2.5px ring mask laid over the border, then fades as it comes home. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-px overflow-hidden rounded-[calc(var(--radius-lg)+1px)] p-[2.5px]"
                        style={{ mask: "linear-gradient(black 0 0) content-box exclude, linear-gradient(black 0 0)", WebkitMask: "linear-gradient(black 0 0) content-box xor, linear-gradient(black 0 0)" }}
                      >
                        <AnimatePresence>
                          {lap > 0 && (
                            <motion.span
                              key={lap}
                              className="absolute top-1/2 left-1/2 aspect-square w-[150%] -translate-1/2"
                              style={{ background: `conic-gradient(from 200deg, transparent 0 50%, ${solid} 72%, color-mix(in oklab, ${solid}, white 65%) 86%, transparent 95%)` }}
                              initial={{ rotate: 0, opacity: 1 }}
                              animate={{ rotate: 360, opacity: [1, 1, 0] }}
                              // On-screen travel takes ease-in-out, so the light moves evenly around the field instead of zipping and stalling.
                            transition={{ duration: 0.75, ease: EASE_IN_OUT, opacity: { duration: 0.75, times: [0, 0.7, 1] } }}
                              onAnimationComplete={() => setLap(0)}
                            />
                          )}
                        </AnimatePresence>
                      </span>
                    </motion.div>
                  <p id={`${uid}-error`} aria-live="polite" className="text-xs text-destructive empty:hidden">
                    {invalid ? "HEX, RGB, HSL veya OKLCH bir renk girin." : ""}
                  </p>
                </div>

                {backdrop && (
                  <div data-slot="color-picker-contrast" className="flex animate-panel-enter items-center gap-2.5 [--stagger:2.4]">
                    <span
                      aria-hidden="true"
                      className="grid h-7 w-9 shrink-0 place-items-center rounded-md text-sm font-semibold shadow-[inset_0_0_0_1px_var(--shade-border)]"
                      style={{ background: contrastWith, color: css }}
                    >
                      Aa
                    </span>
                    <span className="text-sm font-medium tabular-nums">{ratio.toFixed(2)}:1</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">arka plana karşı</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={level.label}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, filter: "blur(2px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, transition: INSTANT }}
                        transition={reduce ? INSTANT : SPRING}
                      >
                        <Badge status={level.status}>{level.label}</Badge>
                      </motion.span>
                    </AnimatePresence>
                    <span className="sr-only">{`Kontrast ${ratio.toFixed(2)}'e 1, ${level.spoken}`}</span>
                  </div>
                )}

                <div data-slot="color-picker-swatches" className="flex animate-panel-enter items-center gap-1.5 [--stagger:3]">
                  <Button ref={addRef} variant="ghost" size="icon-xs" aria-label={`${hex} rengini kaydet`} onClick={saveColor}>
                    <PlusIcon data-anim="spin" />
                  </Button>
                  <Reorder.Group
                    as="div"
                    axis="x"
                    values={swatches}
                    onReorder={setSwatches}
                    role="listbox"
                    aria-label="Kaydedilen renkler"
                    aria-orientation="horizontal"
                    className={cn("flex min-w-0 gap-1.5", swatches.length > 0 && "flex-1")}
                  >
                    <AnimatePresence initial={false}>
                      {swatches.map((color, index) => (
                        <Reorder.Item
                          key={color}
                          value={color}
                          as="button"
                          ref={(node: HTMLButtonElement | null) => {
                            if (node) swatchRefs.current.set(color, node)
                            else swatchRefs.current.delete(color)
                          }}
                          type="button"
                          role="option"
                          aria-selected={color === hex}
                          aria-label={`${color}. Taşımak için Alt ve ok tuşları, silmek için Delete`}
                          tabIndex={color === tabSwatch ? 0 : -1}
                          data-current={color === hex || undefined}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, x: -14 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={reduce ? { opacity: 0, transition: INSTANT } : { opacity: 0, scale: 0.6, transition: FADE_OUT }}
                          transition={reduce ? INSTANT : SPRING}
                          whileDrag={reduce ? undefined : { scale: 1.12, zIndex: 1 }}
                          whileTap={reduce ? undefined : { scale: 0.9 }}
                          dragElastic={0.1}
                          className="relative size-6 shrink-0 cursor-pointer touch-pan-y rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/30 data-current:ring-2 data-current:ring-ring data-current:ring-offset-2 data-current:ring-offset-popover"
                          onFocus={() => setRovingSwatch(color)}
                          onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => onSwatchKey(event, index)}
                          onDragStart={() => {
                            draggedSwatch.current = true
                          }}
                          onDragEnd={() => requestAnimationFrame(() => (draggedSwatch.current = false))}
                          onClick={() => {
                            if (draggedSwatch.current) return
                            const next = parse(color, hsv.h)
                            if (next) commit(next)
                          }}
                        >
                          <Chip color={color} className="size-full rounded-md" />
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                  {swatches.length === 0 && <span className="text-xs text-muted-foreground">Kayıtlı renk yok</span>}
                </div>
                </div>
              </GrowPanel>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        )}
      </AnimatePresence>
    </PopoverPrimitive.Root>
  )
}

export { ColorPicker, type ColorPickerProps, type ColorFormat }
