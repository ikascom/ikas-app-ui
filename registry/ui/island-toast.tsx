"use client"

import * as React from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
  type Transition,
} from "motion/react"
import { AlertTriangleIcon, InfoIcon, OctagonAlertIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { statusTint } from "@/lib/status"
import { EASE_OUT, FADE_IN, FADE_OUT, INSTANT, ISLAND_SPRING, SPRING_EXIT } from "@/lib/motion"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AnimatedCheckIcon } from "@/components/ikas/animated-check"

type IslandType = "default" | "success" | "info" | "warning" | "error" | "loading"

type IslandPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"

type IslandOptions = {
  /** Sending the same id again updates that toast in place, wherever it sits in the stack. */
  id?: string | number
  /** Second line, shown when the toast opens. */
  description?: React.ReactNode
  /** One action button. The toast closes after it runs. */
  action?: { label: string; onClick: () => void }
  /** Milliseconds before the toast leaves. Defaults to the Toaster's duration. `Infinity` keeps it. */
  duration?: number
  /** Sends the toast to the IslandToaster with the same `id`. */
  toasterId?: string
  /** Runs when the toast leaves, by timer, swipe, close button or `island.dismiss`. */
  onDismiss?: () => void
}

type IslandToast = IslandOptions & { id: string | number; type: IslandType; title: React.ReactNode }

/* ---------- Store: island() works from anywhere, like toast() ---------- */

let store: IslandToast[] = []
const EMPTY: IslandToast[] = []
const listeners = new Set<() => void>()
let counter = 0

const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Mounted IslandToasters per `id`. A toast with no toaster to show it is dropped after a grace period. */
const mounted = new Map<string | undefined, number>()
/** Long enough for a toaster that mounts in the same render pass, or right after, to pick the toast up. */
const ORPHAN_GRACE = 1000

function sweep() {
  const next = store.filter((t) => mounted.get(t.toasterId))
  if (next.length === store.length) return
  store = next
  emit()
}

function upsert(type: IslandType, title: React.ReactNode, options: IslandOptions = {}) {
  const id = options.id ?? `island-${++counter}`
  const next: IslandToast = { ...options, id, type, title }
  store = store.some((t) => t.id === id) ? store.map((t) => (t.id === id ? next : t)) : [...store, next]
  emit()
  if (!mounted.get(options.toasterId)) window.setTimeout(sweep, ORPHAN_GRACE)
  return id
}

function dismiss(id?: string | number) {
  const gone = id == null ? store : store.filter((t) => t.id === id)
  store = id == null ? [] : store.filter((t) => t.id !== id)
  gone.forEach((t) => t.onDismiss?.())
  emit()
}

type PromiseMessages<T> = {
  loading: React.ReactNode
  success: React.ReactNode | ((data: T) => React.ReactNode)
  error: React.ReactNode | ((error: unknown) => React.ReactNode)
}

/**
 * island("Kural silindi", { description, action }) shows a toast and returns its id.
 * island.success / info / warning / error / loading set the status; island.promise
 * shows loading and resolves the same toast to success or error. It returns the promise
 * it was given: awaiting it gives the data or throws, and ignoring it leaves no unhandled
 * rejection, since the toast already handles both outcomes.
 */
const island = Object.assign((title: React.ReactNode, options?: IslandOptions) => upsert("default", title, options), {
  success: (title: React.ReactNode, options?: IslandOptions) => upsert("success", title, options),
  info: (title: React.ReactNode, options?: IslandOptions) => upsert("info", title, options),
  warning: (title: React.ReactNode, options?: IslandOptions) => upsert("warning", title, options),
  error: (title: React.ReactNode, options?: IslandOptions) => upsert("error", title, options),
  loading: (title: React.ReactNode, options?: IslandOptions) => upsert("loading", title, options),
  promise<T>(promise: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options?: IslandOptions) {
    const id = upsert("loading", messages.loading, options)
    const p = typeof promise === "function" ? promise() : promise
    p.then(
      (data) => upsert("success", typeof messages.success === "function" ? messages.success(data) : messages.success, { ...options, id }),
      (error) => upsert("error", typeof messages.error === "function" ? messages.error(error) : messages.error, { ...options, id })
    )
    return p
  },
  dismiss,
})

/* ---------- Toaster ---------- */

const PILL_H = 36
const OPEN_W = 332
const PEEK = 8
const GAP = 8
/** Swipe toward the edge: this far, or a flick of 0.11 px/ms (motion reports px/s). */
const SWIPE_DISTANCE = 40
const SWIPE_VELOCITY = 110
/** How far a swipe goes before the toast has faded to its floor. */
const SWIPE_FADE = 80
const RADIUS = 18

type Morph = keyof typeof ISLAND_SPRING

const tint: Record<IslandType, string> = {
  default: statusTint.neutral,
  loading: statusTint.neutral,
  success: statusTint.success,
  info: statusTint.info,
  warning: statusTint.warning,
  error: statusTint.danger,
}

function StatusIcon({ type }: { type: IslandType }) {
  if (type === "success")
    return (
      <span className="flex size-4 items-center justify-center rounded-full bg-(--s-icon) text-(--s-fg)">
        <AnimatedCheckIcon className="size-2.5" strokeWidth={3.5} />
      </span>
    )
  if (type === "loading") return <Spinner className="size-4 text-icon" />
  const Icon = type === "info" ? InfoIcon : type === "warning" ? AlertTriangleIcon : type === "error" ? OctagonAlertIcon : null
  return Icon ? <Icon className="size-4 text-(--s-icon)" /> : null
}

type Layout = { w: number; h: number; y: number; scale: number; opacity: number; wide: boolean; content: boolean; body: boolean }

type ItemProps = {
  toast: IslandToast
  layout: Layout
  /** Which ISLAND_SPRING carries this render's size change. */
  morph: Morph
  tone: NonNullable<IslandToasterProps["tone"]>
  edge: 1 | -1
  justify: string
  openW: number
  front: boolean
  swipeable: boolean
  z: number
  reduce: boolean
  onMeasure: (id: string | number, w: number, h: number) => void
  onClose: (id: string | number) => void
  onDragChange: (dragging: boolean) => void
}

/** Content swaps one rich state for the next: the old one leaves, then the new one enters (mode="wait"). */
const swap = {
  enter: (morph: Morph) => ({ opacity: 0, scale: morph === "fold" ? 1.04 : 0.96, filter: "blur(4px)" }),
  center: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: (morph: Morph) => ({ opacity: 0, scale: morph === "fold" ? 0.96 : 1.04, filter: "blur(4px)" }),
}

function Item({ toast: t, layout, morph, tone, edge, justify, openW, front, swipeable, z, reduce, onMeasure, onClose, onDragChange }: ItemProps) {
  const [entered, setEntered] = React.useState(false)
  const controls = useDragControls()
  // Swipe: the toast tracks the finger 1:1 toward its edge and fades with the distance.
  const dragY = useMotionValue(0)
  const dragOpacity = useTransform(dragY, edge === -1 ? [-SWIPE_FADE, 0] : [0, SWIPE_FADE], edge === -1 ? [0.4, 1] : [1, 0.4])

  // The content remounts when it swaps, so measuring follows the mounted nodes (ref callbacks).
  const nodes = React.useRef<{ head: HTMLElement | null; body: HTMLElement | null }>({ head: null, body: null })
  const observe = React.useCallback(
    (key: "head" | "body", node: HTMLElement | null) => {
      if (!node) return
      nodes.current[key] = node
      const measure = () => {
        const { head, body } = nodes.current
        if (head && body) onMeasure(t.id, head.offsetWidth, body.offsetHeight)
      }
      const ro = new ResizeObserver(measure)
      ro.observe(node)
      measure()
      return () => {
        ro.disconnect()
        if (nodes.current[key] === node) nodes.current[key] = null
      }
    },
    [t.id, onMeasure]
  )
  const headRef = React.useCallback((node: HTMLDivElement | null) => observe("head", node), [observe])
  const bodyRef = React.useCallback((node: HTMLDivElement | null) => observe("body", node), [observe])

  // Enters from beyond its edge by its own height and leaves the same way; layers behind fade where they are.
  const travel = layout.h + 24
  const hasBody = Boolean(t.description || t.action)
  const position: Transition = reduce
    ? { ...INSTANT, opacity: { duration: 0.12 } }
    : { ...(entered ? ISLAND_SPRING.stack : ISLAND_SPRING.enter), opacity: FADE_IN }
  const exit = reduce
    ? { opacity: 0, transition: FADE_OUT }
    : front
      ? { opacity: 0, y: edge * travel, transition: { ...SPRING_EXIT, opacity: { duration: 0.15, ease: EASE_OUT, delay: 0.05 } } }
      : { opacity: 0, scale: 0.95, transition: { ...SPRING_EXIT, opacity: { duration: 0.12, ease: EASE_OUT } } }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    onDragChange(false)
    if (edge * info.offset.y > SWIPE_DISTANCE || edge * info.velocity.y > SWIPE_VELOCITY) return onClose(t.id)
    // Not far enough: back into place, seeded with the release speed; a little bounce, since the drag applied force.
    animate(dragY, 0, reduce ? { duration: 0.12 } : { ...ISLAND_SPRING.release, velocity: info.velocity.y })
  }

  const contentKey = `${t.type}:${typeof t.title === "string" ? t.title : ""}`

  return (
    <div className={cn("pointer-events-none absolute inset-x-0 flex", edge === -1 ? "top-0" : "bottom-0", justify)} style={{ zIndex: z }}>
      {/* Position in the stack: enter, shift back, leave. */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: edge * travel }}
        animate={{ y: layout.y, scale: layout.scale, opacity: layout.opacity }}
        exit={exit}
        transition={position}
        onAnimationComplete={() => setEntered(true)}
        className={cn(layout.opacity ? "pointer-events-auto" : "pointer-events-none", edge === -1 ? "origin-bottom" : "origin-top")}
      >
        {/* Swipe layer. Tracking stays under reduced motion: the user is producing the motion. */}
        <motion.div
          drag={swipeable ? "y" : false}
          dragListener={false}
          dragControls={controls}
          dragMomentum={false}
          // Free toward the edge, rubber-band the other way.
          dragConstraints={edge === -1 ? { bottom: 0 } : { top: 0 }}
          dragElastic={0.2}
          onPointerDown={(e) => {
            // A press on the close or action button is a press, not the start of a swipe.
            if (swipeable && !(e.target as HTMLElement).closest("button")) controls.start(e)
          }}
          onDragStart={() => onDragChange(true)}
          onDragEnd={onDragEnd}
          style={{ y: dragY, opacity: dragOpacity, touchAction: swipeable ? "pan-x" : undefined }}
        >
          {/* The island: morphs between fixed sizes with a layout animation; radius inline so it doesn't warp. */}
          <motion.div
            layout
            data-slot="island-toast"
            data-type={t.type}
            aria-hidden={!layout.content}
            transition={reduce ? INSTANT : ISLAND_SPRING[morph]}
            style={{ width: layout.w, height: layout.h, borderRadius: RADIUS }}
            className={cn("relative overflow-hidden shadow-overlay", tone === "dark" && "bg-island", tone === "light" && "light bg-popover")}
          >
            {/* dark: the content reads the dark palette, the box keeps the page's shadow. */}
            <motion.div
              layout
              initial={false}
              animate={{ opacity: layout.content ? 1 : 0 }}
              transition={{ layout: reduce ? INSTANT : ISLAND_SPRING[morph], opacity: layout.content ? { ...FADE_IN, delay: 0.04 } : FADE_OUT }}
              className={cn("absolute inset-0 text-foreground tabular-nums", tone === "dark" && "dark", tint[t.type])}
            >
              <AnimatePresence mode="wait" initial={false} custom={morph}>
                <motion.div
                  key={contentKey}
                  custom={morph}
                  variants={reduce ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } } : swap}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={reduce ? { duration: 0.12 } : { duration: 0.15, ease: EASE_OUT }}
                  className="absolute inset-0"
                >
                  <motion.div
                    ref={headRef}
                    layout="position"
                    transition={reduce ? INSTANT : ISLAND_SPRING[morph]}
                    className={cn(
                      "absolute top-0 flex h-9 items-center gap-2 pr-3.5 pl-[11px]",
                      layout.wide ? "left-0" : "left-1/2 w-max -translate-x-1/2",
                      t.type === "default" && "pl-3.5"
                    )}
                    style={layout.wide ? { width: openW } : undefined}
                  >
                    {t.type !== "default" && (
                      <span className="grid size-4 shrink-0 place-items-center">
                        <StatusIcon type={t.type} />
                      </span>
                    )}
                    <span className={cn("min-w-0 truncate text-[13px] leading-[18px] font-medium", layout.wide && "flex-1")}>{t.title}</span>
                    {layout.wide && (
                      <button
                        type="button"
                        aria-label="Kapat"
                        onClick={() => onClose(t.id)}
                        // 24px to see, 44px to hit.
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon-xs" }),
                          "relative size-6 rounded-full text-muted-foreground before:absolute before:-inset-2.5"
                        )}
                      >
                        <XIcon />
                      </button>
                    )}
                  </motion.div>
                  <motion.div
                    initial={false}
                    animate={{ opacity: layout.body ? 1 : 0 }}
                    transition={layout.body ? { ...FADE_IN, delay: 0.06 } : FADE_OUT}
                    className={cn("absolute left-0", layout.body ? "pointer-events-auto" : "pointer-events-none")}
                    style={{ top: PILL_H, width: openW }}
                  >
                    {/* Description and the one action share a row, so short content leaves no empty band. */}
                    <div ref={bodyRef} className={cn("flex items-center gap-3", hasBody && "pr-3 pb-3 pl-[35px]", t.type === "default" && "pl-3.5")}>
                      {t.description && <p className="min-w-0 flex-1 text-[12.5px] leading-[17px] text-muted-foreground">{t.description}</p>}
                      {t.action && (
                        <button
                          type="button"
                          className={cn(buttonVariants({ variant: "outline", size: "xs" }), "ml-auto")}
                          onClick={() => {
                            t.action?.onClick()
                            onClose(t.id)
                          }}
                        >
                          {t.action.label}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

/** Two live regions: errors and warnings interrupt, the rest wait their turn. */
function Announcer({ toast }: { toast?: IslandToast }) {
  const [message, setMessage] = React.useState({ polite: "", assertive: "" })
  const text = toast ? [toast.title, toast.description].filter((part) => typeof part === "string").join(". ") : ""
  const loud = toast?.type === "error" || toast?.type === "warning"
  const key = toast ? `${toast.id}:${toast.type}:${text}` : ""
  React.useEffect(() => {
    if (!key) return
    // Clear, then set a frame later, so the same message is announced again.
    let second = 0
    const first = requestAnimationFrame(() => {
      setMessage({ polite: "", assertive: "" })
      second = requestAnimationFrame(() => setMessage(loud ? { polite: "", assertive: text } : { polite: text, assertive: "" }))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [key, loud, text])
  return (
    <>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {message.polite}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {message.assertive}
      </div>
    </>
  )
}

type IslandToasterProps = {
  /** dark: opaque ink in both themes. light: white in both themes. */
  tone?: "dark" | "light"
  /** Edge and side the stack sits on. Top grows down, bottom grows up. */
  position?: IslandPosition
  /** Toasts shown at once: the front one plus folded layers behind it, and rows in the open list. */
  visibleToasts?: number
  /** Default milliseconds per toast; one with a description or action gets 1.5× so it can be read. */
  duration?: number
  /** Distance from the viewport edge in px. */
  offset?: number
  /** Shows only the toasts sent with the same `toasterId`. Without it, only toasts sent without one. */
  id?: string
  /** On the viewport layer; pass `absolute` to pin the stack inside a positioned parent. */
  className?: string
}

type Timer = { dismiss?: number; open: number[]; left: number; start: number }

const stopTimer = (timer?: Timer) => {
  if (!timer) return
  window.clearTimeout(timer.dismiss)
  timer.open.forEach((x) => window.clearTimeout(x))
  timer.open = []
}

/**
 * A dynamic-island toast stack: each toast is a 36px pill that opens to show its
 * description and action. New toasts go to the front and fold the older ones behind
 * it; hover or focus opens the stack as a list and pauses every timer. Swipe toward
 * the edge, the close button or Esc dismisses. Mount once; call island() anywhere.
 */
function IslandToaster({ tone = "dark", position = "top-center", visibleToasts = 3, duration = 4000, offset = 16, id, className }: IslandToasterProps) {
  const reduce = useReducedMotion() ?? false
  const all = React.useSyncExternalStore(subscribe, () => store, () => EMPTY)
  const toasts = React.useMemo(() => all.filter((t) => t.toasterId === id), [all, id])
  const [list, setList] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | number | null>(null)
  const [sizes, setSizes] = React.useState<Record<string, { w: number; h: number }>>({})
  const [rootW, setRootW] = React.useState(0)
  const rootRef = React.useRef<HTMLElement>(null)
  const timers = React.useRef(new Map<string | number, Timer>())
  const seen = React.useRef(new Map<string | number, IslandToast>())
  const frontRef = React.useRef<string | number | undefined>(undefined)
  const hovering = React.useRef(false)
  const hidden = React.useRef(false)
  const dragging = React.useRef(false)
  const paused = React.useRef(false)

  const [vertical, side] = position.split("-") as ["top" | "bottom", "left" | "center" | "right"]
  const edge = vertical === "top" ? -1 : 1
  const justify = side === "left" ? "justify-start" : side === "right" ? "justify-end" : "justify-center"
  const openW = Math.min(OPEN_W, rootW ? rootW - 24 : OPEN_W)

  // A new front toast (a newcomer, or the next one once the front left) starts folded; an empty stack closes the list.
  const frontId = toasts[toasts.length - 1]?.id
  const [prevFront, setPrevFront] = React.useState(frontId)
  if (frontId !== prevFront) {
    setPrevFront(frontId)
    setOpenId(null)
    if (frontId === undefined) setList(false)
  }

  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(() => setRootW(root.offsetWidth))
    ro.observe(root)
    setRootW(root.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const onMeasure = React.useCallback(
    (key: string | number, w: number, h: number) =>
      setSizes((s) => (s[key]?.w === w && s[key]?.h === h ? s : { ...s, [key]: { w, h } })),
    []
  )

  // Each toast keeps its own clock. The front one opens itself after 150ms when it has a body,
  // and folds 1.5s before it leaves; a resumed clock does the same with the time it has left.
  const run = (t: IslandToast, timer: Timer) => {
    timer.start = Date.now()
    timer.dismiss = window.setTimeout(() => dismiss(t.id), timer.left)
    if (t.description || t.action) {
      timer.open.push(window.setTimeout(() => frontRef.current === t.id && setOpenId(t.id), 150))
      timer.open.push(window.setTimeout(() => setOpenId((o) => (o === t.id ? null : o)), Math.max(timer.left - 1500, 300)))
    }
  }
  const arm = (t: IslandToast) => {
    stopTimer(timers.current.get(t.id))
    const ms = t.duration ?? (t.description || t.action ? duration * 1.5 : duration)
    const timer: Timer = { open: [], left: ms, start: Date.now() }
    timers.current.set(t.id, timer)
    if (t.type === "loading" || !Number.isFinite(ms) || paused.current) return
    run(t, timer)
  }

  // Timers freeze while the list is open, a toast is being swiped or the tab is hidden, then resume with what was left.
  const syncTimers = () => {
    const frozen = hovering.current || hidden.current || dragging.current
    const now = Date.now()
    if (frozen && !paused.current)
      timers.current.forEach((timer) => {
        stopTimer(timer)
        timer.left -= now - timer.start
      })
    if (!frozen && paused.current)
      timers.current.forEach((timer, key) => {
        const t = seen.current.get(key)
        if (!t || t.type === "loading" || !Number.isFinite(timer.left)) return
        timer.left = Math.max(timer.left, 1200)
        run(t, timer)
      })
    paused.current = frozen
  }

  // Start a clock for every new or changed toast; forget the ones that left.
  const handleToasts = (current: IslandToast[]) => {
    frontRef.current = current[current.length - 1]?.id
    const ids = new Set(current.map((t) => t.id))
    for (const [key, timer] of timers.current)
      if (!ids.has(key)) {
        stopTimer(timer)
        timers.current.delete(key)
        seen.current.delete(key)
      }
    for (const t of current) {
      if (seen.current.get(t.id) === t) continue
      seen.current.set(t.id, t)
      arm(t)
    }
    if (!current.length && hovering.current) {
      hovering.current = false
      syncTimers()
    }
  }
  const handleVisibility = () => {
    hidden.current = document.hidden
    syncTimers()
  }
  // Effects call the latest handlers without re-subscribing (useEffectEvent needs React 19.2).
  const handlers = React.useRef({ handleToasts, handleVisibility })
  React.useLayoutEffect(() => {
    handlers.current = { handleToasts, handleVisibility }
  })

  React.useEffect(() => handlers.current.handleToasts(toasts), [toasts])
  React.useEffect(() => {
    const handler = () => handlers.current.handleVisibility()
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [])

  React.useEffect(() => {
    const map = timers.current
    return () => map.forEach(stopTimer)
  }, [])

  React.useEffect(() => {
    mounted.set(id, (mounted.get(id) ?? 0) + 1)
    return () => {
      const left = (mounted.get(id) ?? 1) - 1
      if (left) mounted.set(id, left)
      else mounted.delete(id)
      // Deferred, so a remount (Strict Mode, a moved toaster) keeps its toasts.
      window.setTimeout(sweep, ORPHAN_GRACE)
    }
  }, [id])

  const openList = () => {
    if (hovering.current || !toasts.length) return
    hovering.current = true
    setList(true)
    syncTimers()
  }
  const onDragChange = (value: boolean) => {
    dragging.current = value
    syncTimers()
  }
  const closeList = () => {
    if (!hovering.current) return
    hovering.current = false
    setList(false)
    setOpenId(null)
    syncTimers()
  }

  // Layout: collapsed = the front toast plus folded layers that take its size; list = every toast at full size.
  const order = [...toasts].reverse()
  const front = order[0]
  const frontSize = front ? sizes[front.id] : undefined
  const frontOpen = Boolean(front && openId === front.id)
  const wF = frontOpen ? openW : Math.max(frontSize?.w ?? 120, PILL_H)
  const hF = frontOpen ? PILL_H + (frontSize?.h ?? 0) : PILL_H
  const dir = edge === -1 ? 1 : -1
  const layouts: Layout[] = []
  let listH = 0
  for (let i = 0; i < order.length; i++) {
    const visible = i < visibleToasts
    if (list) {
      const h = PILL_H + (sizes[order[i].id]?.h ?? 0)
      layouts.push({ w: openW, h, y: dir * listH, scale: 1, opacity: visible ? 1 : 0, wide: true, content: true, body: true })
      if (visible) listH += h + GAP
      continue
    }
    const depth = Math.min(i, visibleToasts)
    // Each layer back fades a little, so same-colored layers read as separate toasts.
    layouts.push({
      w: wF,
      h: hF,
      y: dir * PEEK * depth,
      scale: 1 - 0.05 * depth,
      opacity: visible ? 1 - 0.2 * depth : 0,
      wide: i === 0 && frontOpen,
      content: i === 0,
      body: i === 0 && frontOpen,
    })
  }
  const morph: Morph = list ? "stack" : frontOpen ? "open" : "fold"
  const boxW = list ? openW : wF
  const boxH = !order.length ? 0 : list ? listH - GAP : hF + PEEK * Math.min(order.length - 1, visibleToasts - 1)

  return (
    <section
      ref={rootRef}
      aria-label="Bildirimler"
      data-slot="island-toaster"
      className={cn("pointer-events-none fixed inset-x-0 z-[100] flex px-3", vertical === "top" ? "items-start" : "items-end", justify, className)}
      style={vertical === "top" ? { top: offset } : { bottom: offset }}
    >
      <motion.div
        tabIndex={order.length ? 0 : -1}
        aria-label={order.length ? `${order.length} bildirim` : undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && openList()}
        onPointerLeave={(e) => e.pointerType === "mouse" && closeList()}
        onClick={openList}
        onFocus={openList}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && closeList()}
        onKeyDown={(e) => e.key === "Escape" && front && dismiss(front.id)}
        initial={false}
        animate={{ width: boxW, height: boxH }}
        transition={reduce ? INSTANT : ISLAND_SPRING[morph]}
        className={cn("relative rounded-[18px] outline-none focus-visible:ring-3 focus-visible:ring-ring/30", order.length && "pointer-events-auto")}
      >
        <AnimatePresence initial={false}>
          {order.map((t, i) => (
            <Item
              key={t.id}
              toast={t}
              layout={layouts[i]}
              morph={morph}
              tone={tone}
              edge={edge}
              justify={justify}
              openW={openW}
              front={i === 0}
              swipeable={i === 0 && !list}
              z={100 - i}
              reduce={reduce}
              onMeasure={onMeasure}
              onClose={dismiss}
              onDragChange={onDragChange}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      <Announcer toast={toasts[toasts.length - 1]} />
    </section>
  )
}

export { IslandToaster, island, type IslandToasterProps, type IslandOptions, type IslandPosition, type IslandType }
