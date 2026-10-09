"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type WheelPickerOption = string | { value: string; label: string }

type WheelPickerSize = "sm" | "default"

type WheelPickerGroupProps = React.ComponentProps<"div"> & {
  /** Row height: sm is 32px, default is 36px. */
  size?: WheelPickerSize
  /** Rows visible through the window. Use an odd number. */
  visibleCount?: number
  /** Dims the group and blocks every wheel in it. */
  disabled?: boolean
}

type WheelPickerProps = Omit<React.ComponentProps<"div">, "defaultValue" | "children" | "onChange"> & {
  /** Rows to pick from. A string is both the value and the label. */
  options: WheelPickerOption[]
  /** Selected value. Leave undefined with defaultValue for an uncontrolled wheel. */
  value?: string
  /** Initial value when uncontrolled. */
  defaultValue?: string
  /** Called with the value under the band: live while dragging, once a flick settles. */
  onValueChange?: (value: string) => void
  /** Row height when used alone. Inside a WheelPickerGroup the group sets it. */
  size?: WheelPickerSize
  /** Rows visible when used alone. Inside a WheelPickerGroup the group sets it. */
  visibleCount?: number
  /** Blocks drag, wheel and keyboard input. */
  disabled?: boolean
  /** Accessible name, e.g. "Saat". */
  "aria-label"?: string
}

const ROW_HEIGHT: Record<WheelPickerSize, number> = { sm: 32, default: 36 }

/*
 * Physics. The snap spring uses the SPRING token values from @/lib/motion
 * (stiffness 350, damping 35: no overshoot) and is integrated here so the wheel
 * needs no animation library. A flick coasts on exponential decay, with its time
 * constant stretched or shrunk so it comes to rest exactly on a row.
 */
const STIFFNESS = 350
const DAMPING = 35
/** ms; how long a flick keeps coasting. */
const COAST = 325
/** rows per ms; caps a hard fling. */
const MAX_VELOCITY = 0.18
/** ms of recent drag that set the release velocity. */
const VELOCITY_WINDOW = 90
/** rows per pixel of wheel or trackpad delta. */
const WHEEL_RATE = 0.012
/** ms of wheel idle before snapping to a row. */
const WHEEL_SETTLE = 110
/** Drag resistance past the first and last row. */
const RUBBER_BAND = 0.3
/** px of movement under which a press counts as a click on a row. */
const CLICK_SLOP = 4

const DEG = Math.PI / 180
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi))
const optionValue = (option: WheelPickerOption) => (typeof option === "string" ? option : option.value)
const optionLabel = (option: WheelPickerOption) => (typeof option === "string" ? option : option.label)

/** Drum geometry: each row spans `angle` degrees on a cylinder of `radius`; rows past `horizon` are hidden. */
function geometry(size: WheelPickerSize, visibleCount: number) {
  const row = ROW_HEIGHT[size]
  const side = Math.max(1, Math.floor(visibleCount / 2))
  const horizon = side + 1
  const angle = 90 / horizon
  const radius = row / Math.tan(angle * DEG)
  return { row, angle, radius, horizon, height: Math.round(2 * radius * Math.sin(side * angle * DEG) + row) }
}

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

type GroupContext = { size: WheelPickerSize; visibleCount: number; disabled: boolean }

const WheelPickerGroupContext = React.createContext<GroupContext | null>(null)

/** Frame for one or more wheels side by side, with one shared selection band (date, time). */
function WheelPickerGroup({ size = "default", visibleCount = 5, disabled = false, className, children, ...props }: WheelPickerGroupProps) {
  const { row, height } = geometry(size, visibleCount)
  const context = React.useMemo(() => ({ size, visibleCount, disabled }), [size, visibleCount, disabled])

  return (
    <WheelPickerGroupContext.Provider value={context}>
      <div
        data-slot="wheel-picker-group"
        data-size={size}
        data-disabled={disabled || undefined}
        role="group"
        className={cn(
          "relative isolate flex overflow-hidden rounded-xl border border-input bg-card px-1.5 shadow-inset transition-[border-color,box-shadow] duration-150 ease-out hover:border-border-strong has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/20 data-disabled:pointer-events-none data-disabled:opacity-50",
          size === "sm" ? "text-[13px]" : "text-sm",
          className
        )}
        style={{ height }}
        {...props}
      >
        <div
          aria-hidden
          data-slot="wheel-picker-band"
          className="pointer-events-none absolute inset-x-1.5 top-1/2 -z-10 -translate-y-1/2 rounded-lg bg-foreground/[0.05] shadow-[inset_0_1px_2px_0_var(--shade-1)]"
          style={{ height: row }}
        />
        {children}
      </div>
    </WheelPickerGroupContext.Provider>
  )
}

/** iOS-style picker wheel: a 3D drum you drag, flick, scroll or step with the keyboard; snaps to a row. */
function WheelPicker(props: WheelPickerProps) {
  const group = React.useContext(WheelPickerGroupContext)
  if (group) return <WheelPickerColumn {...props} size={group.size} visibleCount={group.visibleCount} disabled={group.disabled || props.disabled} />

  const { size = "default", visibleCount = 5, disabled = false, className, ...rest } = props
  return (
    <WheelPickerGroup size={size} visibleCount={visibleCount} disabled={disabled} className={className}>
      <WheelPickerColumn {...rest} size={size} visibleCount={visibleCount} disabled={disabled} />
    </WheelPickerGroup>
  )
}

function WheelPickerColumn({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  size = "default",
  visibleCount = 5,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: WheelPickerProps) {
  const reduce = useReducedMotion()
  const { row, angle, radius, horizon } = geometry(size, visibleCount)
  const last = options.length - 1

  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? valueProp)
  const value = valueProp !== undefined ? valueProp : uncontrolled
  const index = Math.max(0, options.findIndex((o) => optionValue(o) === value))

  const rootRef = React.useRef<HTMLDivElement>(null)
  const drumRef = React.useRef<HTMLUListElement>(null)
  const bandRef = React.useRef<HTMLUListElement>(null)
  /** Position in rows (a float index), the one source of truth for both drums. */
  const scroll = React.useRef(index)
  /** Row the wheel is heading to or resting on. */
  const target = React.useRef(index)
  const emitted = React.useRef(value)
  const frame = React.useRef(0)
  const wheelTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const drag = React.useRef<{ startY: number; startScroll: number; moved: boolean; samples: [number, number][] } | null>(null)
  const [grabbing, setGrabbing] = React.useState(false)

  // Handlers read the latest props through this ref, so listeners bind once.
  const latest = React.useRef({ options, last, row, angle, radius, horizon, reduce, disabled, onValueChange, controlled: valueProp !== undefined })
  React.useLayoutEffect(() => {
    latest.current = { options, last, row, angle, radius, horizon, reduce, disabled, onValueChange, controlled: valueProp !== undefined }
  })

  const paint = React.useCallback((position: number) => {
    scroll.current = position
    const { angle, radius, horizon } = latest.current
    for (const list of [drumRef.current, bandRef.current]) {
      if (!list) continue
      list.style.transform = `translateZ(${-radius}px) rotateX(${angle * position}deg)`
      for (const node of list.children) {
        const item = node as HTMLElement
        const hidden = Math.abs(Number(item.dataset.index) - position) > horizon
        // Write only on change: touching style every frame forces a recalc per row.
        if (item.hidden !== hidden) item.hidden = hidden
      }
    }
  }, [])

  const emit = React.useCallback((i: number) => {
    const { options, last, controlled, onValueChange } = latest.current
    const option = options[clamp(Math.round(i), 0, last)]
    if (!option) return
    const next = optionValue(option)
    if (next === emitted.current) return
    emitted.current = next
    if (!controlled) setUncontrolled(next)
    onValueChange?.(next)
  }, [])

  const stop = React.useCallback(() => cancelAnimationFrame(frame.current), [])

  /** Spring from the current position to row `to`, keeping `velocity` (rows per second). */
  const springTo = React.useCallback(
    (to: number, velocity = 0) => {
      stop()
      const end = clamp(Math.round(to), 0, latest.current.last)
      target.current = end
      if (latest.current.reduce) {
        paint(end)
        emit(end)
        return
      }
      let position = scroll.current
      let v = velocity
      let then = performance.now()
      const step = (now: number) => {
        const dt = Math.min((now - then) / 1000, 1 / 30)
        then = now
        for (let i = 0; i < 4; i++) {
          const h = dt / 4
          v += (-STIFFNESS * (position - end) - DAMPING * v) * h
          position += v * h
        }
        if (Math.abs(position - end) < 0.001 && Math.abs(v) < 0.05) {
          paint(end)
          emit(end)
          return
        }
        paint(position)
        frame.current = requestAnimationFrame(step)
      }
      frame.current = requestAnimationFrame(step)
    },
    [paint, emit, stop]
  )

  /** Coast a flick of `velocity` (rows per ms) to the nearest row it would reach, then hand over to the spring. */
  const fling = React.useCallback(
    (velocity: number) => {
      const { last, reduce } = latest.current
      const from = scroll.current
      const to = clamp(Math.round(from + velocity * COAST), 0, last)
      const distance = to - from
      const tau = distance / velocity
      // Out of bounds, too slow, or a coast that would crawl or snap: let the spring finish it.
      if (reduce || from < 0 || from > last || !Number.isFinite(tau) || tau < COAST * 0.4 || tau > COAST * 2) {
        springTo(to, from < 0 || from > last ? 0 : velocity * 1000)
        return
      }
      stop()
      target.current = to
      const start = performance.now()
      const step = (now: number) => {
        const decay = Math.exp(-(now - start) / tau)
        const position = from + distance * (1 - decay)
        if (Math.abs(to - position) < 0.5) {
          paint(position)
          springTo(to, ((to - position) / tau) * 1000)
          return
        }
        paint(position)
        frame.current = requestAnimationFrame(step)
      }
      frame.current = requestAnimationFrame(step)
    },
    [paint, springTo, stop]
  )

  // Follow value changes from outside unless a drag is running, and re-cull rows when the options change.
  const seen = React.useRef(index)
  React.useLayoutEffect(() => {
    emitted.current = value
    const changed = index !== seen.current
    seen.current = index
    if (drag.current) return
    if (changed && index !== target.current) springTo(index)
    else paint(scroll.current)
  }, [index, value, options, paint, springTo])

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      clearTimeout(wheelTimer.current)
    },
    []
  )

  // Wheel needs a non-passive listener so it can stop the page scrolling behind the drum.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onWheel = (event: WheelEvent) => {
      const { disabled, last } = latest.current
      if (disabled) return
      event.preventDefault()
      stop()
      const px = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
      const next = clamp(scroll.current + px * WHEEL_RATE, 0, last)
      paint(next)
      target.current = Math.round(next)
      emit(next)
      clearTimeout(wheelTimer.current)
      wheelTimer.current = setTimeout(() => springTo(scroll.current), WHEEL_SETTLE)
    }
    root.addEventListener("wheel", onWheel, { passive: false })
    return () => root.removeEventListener("wheel", onWheel)
  }, [paint, emit, springTo, stop])

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return
    stop()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // WebKit throws when the system already claimed the pointer; implicit capture still applies.
    }
    drag.current = { startY: event.clientY, startScroll: scroll.current, moved: false, samples: [[event.clientY, event.timeStamp]] }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    if (!d.moved && Math.abs(event.clientY - d.startY) < CLICK_SLOP) return
    if (!d.moved) {
      d.moved = true
      setGrabbing(true)
    }
    d.samples.push([event.clientY, event.timeStamp])
    if (d.samples.length > 8) d.samples.shift()
    let next = d.startScroll + (d.startY - event.clientY) / row
    if (next < 0) next *= RUBBER_BAND
    else if (next > last) next = last + (next - last) * RUBBER_BAND
    paint(next)
    target.current = clamp(Math.round(next), 0, last)
    emit(next)
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    drag.current = null
    setGrabbing(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (event.type === "pointercancel") return springTo(scroll.current)

    if (!d.moved) {
      // A click on a dimmed row turns the drum to it. Rows bunch up towards the horizon, hence asin.
      const box = event.currentTarget.getBoundingClientRect()
      const offset = clamp((event.clientY - (box.top + box.height / 2)) / radius, -1, 1)
      return springTo(target.current + Math.round(Math.asin(offset) / (angle * DEG)))
    }

    // Release velocity averaged over the last VELOCITY_WINDOW ms, so one noisy frame can't fling.
    const end = d.samples[d.samples.length - 1]
    const start = d.samples.find((s) => end[1] - s[1] <= VELOCITY_WINDOW) ?? end
    const dt = end[1] - start[1]
    fling(dt > 0 ? clamp((start[0] - end[0]) / row / dt, -MAX_VELOCITY, MAX_VELOCITY) : 0)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (disabled) return
    const by: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5, Home: -Infinity, End: Infinity }
    if (!(event.key in by)) return
    event.preventDefault()
    springTo(clamp(target.current + by[event.key], 0, last))
  }

  const rows = (crisp: boolean) =>
    options.map((option, i) => (
      <li
        key={optionValue(option)}
        data-index={i}
        className={cn(
          "absolute inset-x-0 flex items-center justify-center truncate px-2 tabular-nums backface-hidden",
          crisp ? "font-medium text-foreground" : "text-muted-foreground"
        )}
        style={{ top: -row / 2, height: row, transform: `rotateX(${-angle * i}deg) translateZ(${radius}px)` }}
      >
        {optionLabel(option)}
      </li>
    ))

  const drum = "absolute inset-x-0 top-1/2 m-0 h-0 list-none p-0 transform-3d will-change-transform"
  const selected = options[index]

  return (
    <div
      {...props}
      ref={rootRef}
      data-slot="wheel-picker"
      role="spinbutton"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={index}
      aria-valuetext={selected ? optionLabel(selected) : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "group/wheel relative min-w-0 flex-1 touch-none overflow-hidden outline-none select-none [-webkit-touch-callout:none] [mask-image:linear-gradient(to_bottom,transparent,black_22%,black_78%,transparent)]",
        grabbing ? "cursor-grabbing" : "cursor-grab",
        className
      )}
      style={{ perspective: 1000 }}
    >
      <ul ref={drumRef} aria-hidden className={drum}>
        {rows(false)}
      </ul>
      {/* The same drum again, clipped to the band and drawn crisp; one transform keeps the copies in register. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden rounded-md transition-[background-color] duration-150 ease-out group-focus-visible/wheel:bg-foreground/[0.06]"
        style={{ height: row, perspective: 1000 }}
      >
        <ul ref={bandRef} className={drum}>
          {rows(true)}
        </ul>
      </div>
    </div>
  )
}

export { WheelPicker, WheelPickerGroup, type WheelPickerProps, type WheelPickerGroupProps, type WheelPickerOption }
