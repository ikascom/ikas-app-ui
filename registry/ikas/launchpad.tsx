"use client"

import * as React from "react"
import { ChevronUpIcon, XIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { EASE_OUT, ICON_SPRING, INSTANT, SPRING, SPRING_EXIT, STAGGER } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AnimatedNumber } from "@/components/ikas/animated-number"
import { Collapse } from "@/components/ikas/collapse"
import { SwapText } from "@/components/ikas/swap-text"
import { ProgressBar, type ProgressSegmentType } from "@/components/ikas/progress-bar"
import { CheckGlyph, StepMarker, markerWidth, useStepMarkerShape, type StepMarkerShape } from "@/components/ikas/step-kit"

type LaunchpadStepStatus = "todo" | "done" | "blocked"

type LaunchpadStep = {
  id: string
  label: React.ReactNode
  /** Shown under the label while the step is active. One or two sentences. */
  description?: React.ReactNode
  /** Rough effort shown on the right, e.g. "~2 dk". */
  eta?: React.ReactNode
  /** Defaults to "todo", or "blocked" while a step in `requires` is not done. */
  status?: LaunchpadStepStatus
  /** Ids of steps that must be done first. */
  requires?: string[]
  /** Buttons shown while the step is active. Primary first, then one secondary. */
  actions?: React.ReactNode
}

type LaunchpadProps = Omit<React.ComponentProps<"section">, "title"> & {
  steps: LaunchpadStep[]
  /** The open step. Leave undefined to let the Launchpad manage it. */
  activeId?: string | null
  /** Called when a step is focused, and when the active step is completed and the next one opens. */
  onActiveChange?: (id: string) => void
  /** Called once when the last step is done. */
  onComplete?: () => void
  /** Shows only the header and the next step. Leave undefined to let the Launchpad manage it. */
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Small label at the top left. */
  title?: React.ReactNode
  /** Shows a close button once every step is done. */
  onDismiss?: () => void
  /**
   * rail: numbered steps on a line. timeline: the rail with motion: markers draw a check, the line fills
   * down to the next step, the title is struck through. checklist: tickable rows that fold into a
   * "Tamamlananlar" group, with a ring in the header.
   */
  layout?: "rail" | "timeline" | "checklist"
  /** Step marker shape: diamond (default), circle, square or pill. Defaults to the StepMarkerProvider's. */
  marker?: StepMarkerShape
  /** Checklist only: lets the user tick a step done (or undo it). Without it, steps finish through their actions. */
  onStepToggle?: (id: string, done: boolean) => void
  /** Checklist and timeline: header title once every step is done. */
  doneTitle?: React.ReactNode
  /** Progress shown in the header: a ring, a bar or one of ProgressBar's segment types. Defaults to "ring" in the checklist, "skew" in rail and timeline. */
  progressType?: LaunchpadProgressType
}

type LaunchpadProgressType = "ring" | "bar" | ProgressSegmentType

type ResolvedStep = LaunchpadStep & { status: LaunchpadStepStatus; index: string; waitingFor?: ResolvedStep }

const pad = (n: number) => String(n).padStart(2, "0")

function resolveSteps(steps: LaunchpadStep[]): ResolvedStep[] {
  const done = new Set(steps.filter((s) => s.status === "done").map((s) => s.id))
  const indexOf = new Map(steps.map((s, i) => [s.id, i]))
  const resolved: ResolvedStep[] = steps.map((step, i) => ({ ...step, status: step.status ?? "todo", index: pad(i + 1) }))
  for (const step of resolved) {
    if (step.status === "done") continue
    const missing = step.requires?.find((id) => !done.has(id))
    if (missing !== undefined) {
      step.status = "blocked"
      const at = indexOf.get(missing)
      if (at !== undefined) step.waitingFor = resolved[at]
    }
  }
  return resolved
}

/** The step to open after `fromId`: the first open, unblocked step after it, then before it. */
function nextStep(steps: ResolvedStep[], fromId?: string | null): string | null {
  const from = steps.findIndex((s) => s.id === fromId)
  const ordered = [...steps.slice(from + 1), ...steps.slice(0, Math.max(from, 0))]
  return (ordered.find((s) => s.status === "todo") ?? ordered.find((s) => s.status === "blocked"))?.id ?? null
}

const doneIds = (key: string) => key.split("|").filter(Boolean)

/** Outline and core of each marker shape, drawn in a 16px box. */
function NodeShape({ shape, part, ...props }: { shape: StepMarkerShape; part: "outline" | "core" } & React.SVGProps<SVGElement>) {
  const outline = part === "outline"
  if (shape === "circle") return <circle cx={8} cy={8} r={outline ? 6.4 : 2.6} {...(props as React.SVGProps<SVGCircleElement>)} />
  if (shape === "square") return outline ? <rect x={1.8} y={1.8} width={12.4} height={12.4} rx={3} {...(props as React.SVGProps<SVGRectElement>)} /> : <rect x={5.4} y={5.4} width={5.2} height={5.2} rx={1.2} {...(props as React.SVGProps<SVGRectElement>)} />
  if (shape === "pill") return outline ? <rect x={0.8} y={3.6} width={14.4} height={8.8} rx={4.4} {...(props as React.SVGProps<SVGRectElement>)} /> : <rect x={4.6} y={6.4} width={6.8} height={3.2} rx={1.6} {...(props as React.SVGProps<SVGRectElement>)} />
  return <path d={outline ? "M8 1.6 14.4 8 8 14.4 1.6 8Z" : "M8 5.4 10.6 8 8 10.6 5.4 8Z"} {...(props as React.SVGProps<SVGPathElement>)} />
}

/** Step marker: a diamond by default. Filled when done, with a core while active, dashed while blocked. */
function StepNode({ status, active, shape }: { status: LaunchpadStepStatus; active: boolean; shape: StepMarkerShape }) {
  return (
    <svg data-slot="launchpad-node" viewBox="0 0 16 16" className="size-4 shrink-0 overflow-visible" aria-hidden>
      {status === "done" ? (
        <NodeShape shape={shape} part="outline" className="fill-foreground stroke-foreground" strokeWidth={1.5} strokeLinejoin="round" />
      ) : active ? (
        <>
          <NodeShape shape={shape} part="outline" className="fill-card stroke-foreground" strokeWidth={1.5} strokeLinejoin="round" />
          <NodeShape shape={shape} part="core" className="fill-foreground" />
        </>
      ) : (
        <NodeShape
          shape={shape}
          part="outline"
          className={cn("fill-card", status === "blocked" ? "stroke-border-strong" : "stroke-icon")}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeDasharray={status === "blocked" ? "2.4 2.1" : undefined}
        />
      )}
    </svg>
  )
}

/** Header ring of the checklist layout: fills with the done steps; at the end it turns green and a check draws in. */
function ProgressRing({ done, total, small = false }: { done: number; total: number; small?: boolean }) {
  const reduce = useReducedMotion()
  const ratio = total > 0 ? done / total : 0
  const complete = total > 0 && done === total
  return (
    <span
      role="progressbar"
      aria-label="Tamamlanan adımlar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-valuetext={`${total} adımdan ${done} tanesi tamamlandı`}
      className={cn("relative grid shrink-0 place-items-center", small ? "size-5" : "size-9", complete ? "text-success" : "text-chart-ink")}
    >
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={18} cy={18} r={15} fill="none" strokeWidth={3.5} className="stroke-[color-mix(in_oklab,var(--chart-ink)_9%,var(--card))]" />
        <motion.circle
          cx={18}
          cy={18}
          r={15}
          fill="none"
          strokeWidth={3.5}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          className="stroke-current transition-colors duration-200 ease-out"
          initial={false}
          // At 0 the round cap would show as a dot, so the arc fades out instead.
          animate={{ strokeDashoffset: 1 - ratio, opacity: ratio > 0 ? 1 : 0 }}
          transition={reduce ? INSTANT : { strokeDashoffset: SPRING, opacity: { duration: 0.12 } }}
        />
      </svg>
      <AnimatePresence initial={false}>
        {complete && (
          <motion.span
            key="check"
            className="relative flex"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1, transition: reduce ? { duration: 0.12 } : { scale: { ...ICON_SPRING, delay: 0.12 }, opacity: { duration: 0.16, delay: 0.12 } } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <CheckGlyph delay={0.12} className={small ? "size-3" : "size-4"} />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/**
 * Header progress in any type but the checklist's big ring. Bar segments stay 10px each, so the
 * strip grows with the step count; the bar gets a fixed width; points keep their own size.
 */
function HeaderProgress({ type, done, total }: { type: LaunchpadProgressType; done: number; total: number }) {
  if (type === "ring") return <ProgressRing done={done} total={total} small />
  const points = type === "dot" || type === "diamond"
  const gap = type === "notch" ? 2 : 3
  return (
    <ProgressBar
      aria-label="Tamamlanan adımlar"
      hideValue
      variant={type === "bar" ? "bar" : "segments"}
      segmentType={type === "bar" ? undefined : type}
      value={done}
      max={total}
      className={cn("shrink-0", type === "bar" ? "w-24" : points && "w-auto")}
      style={type === "bar" || points ? undefined : { width: total * 10 + (total - 1) * gap }}
    />
  )
}

/**
 * The line between two markers: a faint dashed track, and an ink line that runs down it once the step
 * above is done. In the checklist each row draws its own half, so the line also follows rows that fold.
 */
function RailSegment({ filled, delay = 0, className }: { filled: boolean; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span aria-hidden data-slot="launchpad-rail" className={cn("pointer-events-none absolute w-[1.5px] overflow-hidden", className)}>
      <span className="absolute inset-0 border-l-[1.5px] border-dashed border-border-strong" />
      <motion.span
        className="absolute inset-0 origin-top bg-chart-ink"
        initial={false}
        animate={{ scaleY: filled ? 1 : 0 }}
        transition={reduce ? INSTANT : { ...SPRING, delay }}
      />
    </span>
  )
}

/** How long a ticked row stays in place before it folds into "Tamamlananlar". */
const SETTLE_MS = 100

/**
 * First-run steps on the app's home screen. A vertical rail of numbered steps:
 * the active one opens in place with its actions, any step can be focused, and
 * finishing a step opens the next one. Collapses to its header and the next step.
 */
function Launchpad({
  steps,
  activeId,
  onActiveChange,
  onComplete,
  collapsed,
  onCollapsedChange,
  title = "Başlangıç",
  onDismiss,
  layout = "rail",
  marker,
  onStepToggle,
  doneTitle = "Her şey hazır",
  progressType,
  className,
  style,
  ...props
}: LaunchpadProps) {
  const baseId = React.useId()
  const reduce = useReducedMotion()
  const shape = useStepMarkerShape(marker)
  const listRef = React.useRef<HTMLOListElement>(null)
  const resolved = React.useMemo(() => resolveSteps(steps), [steps])
  const doneCount = resolved.filter((s) => s.status === "done").length
  const allDone = resolved.length > 0 && doneCount === resolved.length
  const doneKey = resolved.map((s) => (s.status === "done" ? s.id : "")).join("|")
  const progress = progressType ?? (layout === "checklist" ? "ring" : "skew")

  // Active step: controlled through activeId, or kept here.
  const [ownActive, setOwnActive] = React.useState<string | null>(() => nextStep(resolved))
  const active = activeId === undefined ? ownActive : activeId

  const [ownCollapsed, setOwnCollapsed] = React.useState(false)
  const isCollapsed = collapsed ?? ownCollapsed
  const setCollapsed = (value: boolean) => {
    if (collapsed === undefined) setOwnCollapsed(value)
    onCollapsedChange?.(value)
  }

  // When the active step is completed, open the next one. Uncontrolled: adjust during render.
  const [seenDoneKey, setSeenDoneKey] = React.useState(doneKey)
  if (seenDoneKey !== doneKey) {
    setSeenDoneKey(doneKey)
    const wasDone = new Set(doneIds(seenDoneKey))
    const justDone = ownActive !== null && !wasDone.has(ownActive) && doneIds(doneKey).includes(ownActive)
    if (activeId === undefined && (ownActive === null || justDone)) setOwnActive(nextStep(resolved, ownActive))
  }

  // Controlled activeId and onComplete are told from an effect, after the change has rendered.
  const latest = React.useRef({ onActiveChange, onComplete, activeId, resolved })
  React.useLayoutEffect(() => {
    latest.current = { onActiveChange, onComplete, activeId, resolved }
  })
  const previousDoneKey = React.useRef(doneKey)
  React.useEffect(() => {
    const before = new Set(doneIds(previousDoneKey.current))
    previousDoneKey.current = doneKey
    const now = doneIds(doneKey)
    const { onActiveChange: change, onComplete: complete, activeId: controlled, resolved: current } = latest.current
    if (controlled && now.includes(controlled) && !before.has(controlled)) {
      const next = nextStep(current, controlled)
      if (next) change?.(next)
    }
    if (now.length === current.length && before.size < current.length) complete?.()
  }, [doneKey])

  const focusStep = (id: string) => {
    if (activeId === undefined) setOwnActive(id)
    onActiveChange?.(id)
  }

  function onListKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("[data-slot=launchpad-step-trigger]") ?? [])
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (at === -1) return
    const target =
      event.key === "ArrowDown" ? buttons[Math.min(at + 1, buttons.length - 1)]
      : event.key === "ArrowUp" ? buttons[Math.max(at - 1, 0)]
      : event.key === "Home" ? buttons[0]
      : event.key === "End" ? buttons[buttons.length - 1]
      : undefined
    if (!target) return
    event.preventDefault()
    target.focus()
  }

  const upNext = resolved.find((s) => s.id === active && s.status !== "done") ?? resolved.find((s) => s.id === nextStep(resolved))
  const listId = `${baseId}-steps`

  // Checklist: a ticked row stays a beat, then folds into "Tamamlananlar". Un-ticked rows come back at once.
  const [settled, setSettled] = React.useState<string[]>(() => doneIds(doneKey))
  const [groupOpen, setGroupOpen] = React.useState(false)
  // The done list starts closed again whenever the card finishes or stops being finished.
  const [groupFor, setGroupFor] = React.useState(allDone)
  if (groupFor !== allDone) {
    setGroupFor(allDone)
    setGroupOpen(false)
  }
  const rowRefs = React.useRef(new Map<string, HTMLLIElement>())
  const focusNext = React.useRef(false)
  // An un-ticked step leaves "Tamamlananlar" at once: adjusted during render, not in an effect.
  const [settledFor, setSettledFor] = React.useState(doneKey)
  if (settledFor !== doneKey) {
    setSettledFor(doneKey)
    const nowDone = new Set(doneIds(doneKey))
    if (settled.some((id) => !nowDone.has(id))) setSettled(settled.filter((id) => nowDone.has(id)))
  }
  React.useEffect(() => {
    if (layout !== "checklist") return
    const timers = doneIds(doneKey).map((id) =>
      setTimeout(() => {
        // If focus was in the folding row, hand it to the step that opens next.
        if (rowRefs.current.get(id)?.contains(document.activeElement)) focusNext.current = true
        setSettled((current) => (current.includes(id) ? current : [...current, id]))
      }, SETTLE_MS)
    )
    return () => timers.forEach(clearTimeout)
  }, [doneKey, layout])
  React.useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    const next = listRef.current?.querySelector<HTMLElement>("[data-slot=launchpad-panel] button:not(:disabled), [data-slot=launchpad-step-trigger]")
    next?.focus({ preventScroll: true })
  })

  if (layout === "checklist") {
    const openSteps = resolved.filter((s) => !settled.includes(s.id))
    const settledSteps = resolved.filter((s) => settled.includes(s.id))
    // Every row has folded away: the card shrinks to its header and the done list opens from there.
    const finished = allDone && openSteps.length === 0
    const rowMotion = reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0.1 } } }
      : {
          initial: { height: 0, opacity: 0 },
          animate: { height: "auto", opacity: 1, transition: { height: SPRING, opacity: { duration: 0.2, delay: 0.04, ease: EASE_OUT } } },
          exit: { height: 0, opacity: 0, transition: { height: SPRING_EXIT, opacity: { duration: 0.12 } } },
        }
    return (
      <section
        data-slot="launchpad"
        data-layout="checklist"
        data-collapsed={isCollapsed || undefined}
        aria-labelledby={`${baseId}-title`}
        className={cn("flex flex-col rounded-xl bg-card shadow-card", className)}
        style={style}
        {...props}
      >
        <header className="flex min-h-14 items-center gap-3 py-3 pr-2.5 pl-4">
          {progress === "ring" && <ProgressRing done={doneCount} total={resolved.length} />}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 id={`${baseId}-title`} className="truncate text-sm font-semibold text-foreground">
              <SwapText swapKey={allDone ? "done" : "todo"}>{allDone ? doneTitle : title}</SwapText>
            </h2>
            <p className="text-[12.5px] text-muted-foreground tabular-nums">
              <AnimatedNumber value={doneCount} />/{resolved.length} tamamlandı
              {finished && (
                <>
                  {" · "}
                  <button
                    type="button"
                    aria-expanded={groupOpen}
                    aria-controls={listId}
                    onClick={() => setGroupOpen(!groupOpen)}
                    className="rounded-sm text-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/30"
                  >
                    {groupOpen ? "Adımları gizle" : "Adımları gör"}
                  </button>
                </>
              )}
            </p>
          </div>
          {progress !== "ring" && <HeaderProgress type={progress} done={doneCount} total={resolved.length} />}
          {/* A finished card has nothing left to collapse; it keeps only the close button. */}
          {!finished && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={isCollapsed ? "Genişlet" : "Küçült"}
              aria-expanded={!isCollapsed}
              aria-controls={listId}
              onClick={() => setCollapsed(!isCollapsed)}
              className="text-icon hover:text-foreground aria-expanded:bg-transparent aria-expanded:hover:bg-muted"
            >
              <motion.span aria-hidden className="flex" initial={false} animate={{ rotate: isCollapsed ? 180 : 0 }} transition={reduce ? INSTANT : ICON_SPRING}>
                <ChevronUpIcon />
              </motion.span>
            </Button>
          )}
          {allDone && onDismiss && (
            <Button variant="ghost" size="icon-sm" aria-label="Kapat" onClick={onDismiss} className={cn("text-icon", !finished && "-ml-2")}>
              <XIcon />
            </Button>
          )}
        </header>

        <Collapse open={isCollapsed && !!upNext} className="px-2.5 pb-2.5">
          {upNext && (
            <button
              type="button"
              onClick={() => (focusStep(upNext.id), setCollapsed(false))}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed px-2.5 py-2 text-left text-sm transition-colors duration-150 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <span className="text-[13px] text-muted-foreground">Sıradaki</span>
              <span className="min-w-0 flex-1 truncate font-medium">{upNext.label}</span>
              {upNext.eta && <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{upNext.eta}</span>}
            </button>
          )}
        </Collapse>

        <Collapse open={finished ? groupOpen : !isCollapsed} id={listId}>
          <div className="border-t">
            {/* When every row has folded away the list closes too, so no empty band is left between the rules. */}
            <Collapse open={openSteps.length > 0}>
              <ol ref={listRef} onKeyDown={onListKeyDown} aria-label="Yapılacak adımlar" className="flex flex-col p-1.5">
                <AnimatePresence initial={false}>
                  {openSteps.map((step, i) => {
                    const isActive = step.id === active && !allDone
                    // The line into this row is filled when the row above is done; the line out of it when this one is.
                    const hasPrev = i > 0
                    const hasNext = i < openSteps.length - 1
                    const isDone = step.status === "done"
                    const panelId = `${baseId}-step-${step.id}`
                    const titleId = `${baseId}-title-${step.id}`
                    const markerStatus = isDone ? "done" : step.status === "blocked" ? "blocked" : isActive ? "current" : "upcoming"
                    const meta = step.status === "blocked" && step.waitingFor ? `${step.waitingFor.index} bitince` : step.eta
                    return (
                      <motion.li
                        key={step.id}
                        ref={(el: HTMLLIElement | null) => void (el ? rowRefs.current.set(step.id, el) : rowRefs.current.delete(step.id))}
                        data-status={step.status}
                        className="relative overflow-hidden"
                        {...rowMotion}
                      >
                        {hasPrev && <RailSegment filled={openSteps[i - 1].status === "done"} delay={STAGGER} className="top-0 left-[22.25px] h-[9px]" />}
                        {hasNext && <RailSegment filled={isDone} className="top-[33px] bottom-0 left-[22.25px]" />}
                        <div className={cn("grid grid-cols-[34px_minmax(0,1fr)] items-start gap-x-1.5 rounded-lg px-1.5 py-1 transition-colors duration-200 ease-out", isActive && "bg-muted/70")}>
                          {onStepToggle ? (
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={isDone}
                              aria-labelledby={titleId}
                              disabled={step.status === "blocked"}
                              onClick={() => onStepToggle(step.id, !isDone)}
                              className="grid size-[34px] place-items-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60 [&:active>span]:scale-90 [&>span]:transition-[scale] [&>span]:duration-100"
                            >
                              <StepMarker status={markerStatus} shape={shape} size="sm" />
                            </button>
                          ) : (
                            <span className="grid size-[34px] place-items-center">
                              <StepMarker status={markerStatus} shape={shape} size="sm" />
                            </span>
                          )}
                          <div className="flex min-w-0 flex-col">
                            <button
                              type="button"
                              id={titleId}
                              data-slot="launchpad-step-trigger"
                              aria-current={isActive ? "step" : undefined}
                              aria-expanded={isActive}
                              aria-controls={panelId}
                              onClick={() => focusStep(step.id)}
                              className="flex min-h-[34px] w-full items-center gap-2 rounded-md text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                            >
                              {/* The strike draws left to right across each line when the step is ticked. */}
                              <span
                                className={cn(
                                  "min-w-0 flex-1 bg-[linear-gradient(currentColor,currentColor)] bg-[position:0_58%] bg-no-repeat transition-[background-size,color] ease-out motion-reduce:transition-none",
                                  isDone ? "bg-[length:100%_1px] text-muted-foreground delay-[60ms] duration-[360ms]"
                                  : step.status === "blocked" && !isActive ? "bg-[length:0%_1px] text-muted-foreground duration-150"
                                  : "bg-[length:0%_1px] font-medium text-foreground duration-150"
                                )}
                              >
                                {step.label}
                              </span>
                              {meta && !isDone && <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{meta}</span>}
                            </button>
                            <Collapse open={isActive && !isDone} id={panelId}>
                              <div data-slot="launchpad-panel" className="flex flex-col gap-3 pb-2.5">
                                {step.description && <p className="max-w-prose text-[13px] text-muted-foreground">{step.description}</p>}
                                {step.status === "blocked" && step.waitingFor && (
                                  <p className="text-[13px] text-foreground">
                                    Önce <span className="font-medium tabular-nums">{step.waitingFor.index}</span> · {step.waitingFor.label} adımını tamamlayın.
                                  </p>
                                )}
                                {step.actions && (
                                  <fieldset disabled={step.status === "blocked"} className="flex min-w-0 flex-wrap items-center gap-2 disabled:opacity-60">
                                    {step.actions}
                                  </fieldset>
                                )}
                              </div>
                            </Collapse>
                          </div>
                        </div>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ol>
            </Collapse>

            <Collapse open={settledSteps.length > 0}>
              <div className={cn(openSteps.length > 0 && "border-t")}>
                {/* Once finished, the header's "Adımları gör" opens the list instead of this row. */}
                <Collapse open={!finished}>
                  <button
                    type="button"
                    aria-expanded={groupOpen}
                    aria-controls={`${baseId}-done`}
                    onClick={() => setGroupOpen(!groupOpen)}
                    className="flex min-h-11 w-full items-center gap-2 pr-4 pl-[52px] text-left text-[13px] text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:ring-inset"
                  >
                    <span className="tabular-nums">
                      <AnimatedNumber value={settledSteps.length} /> tamamlandı
                    </span>
                    <motion.span aria-hidden className="ml-auto flex text-icon" initial={false} animate={{ rotate: groupOpen ? 0 : 180 }} transition={reduce ? INSTANT : ICON_SPRING}>
                      <ChevronUpIcon className="size-4" />
                    </motion.span>
                  </button>
                </Collapse>
                <Collapse open={groupOpen} id={`${baseId}-done`}>
                  <ul aria-label="Tamamlanan adımlar" className="flex flex-col px-1.5 pb-1.5">
                    <AnimatePresence initial={false}>
                      {settledSteps.map((step) => (
                        <motion.li key={step.id} className="overflow-hidden" {...rowMotion}>
                          <div className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-x-1.5 px-1.5 py-1">
                            <span className="grid size-[34px] place-items-center">
                              <StepMarker status="done" shape={shape} size="sm" />
                            </span>
                            <span className="min-w-0 truncate text-sm text-muted-foreground line-through decoration-border-strong">{step.label}</span>
                            {onStepToggle && (
                              <Button variant="ghost" size="xs" onClick={() => onStepToggle(step.id, false)}>
                                Geri al
                              </Button>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </Collapse>
              </div>
            </Collapse>
          </div>
        </Collapse>
        <span role="status" className="sr-only">
          {allDone ? "Tüm adımlar tamamlandı" : `${resolved.length} adımdan ${doneCount} tanesi tamamlandı`}
        </span>
      </section>
    )
  }

  // rail and timeline share the layout; timeline swaps in the animated parts.
  const timeline = layout === "timeline"
  const markerVar = timeline ? ({ "--marker-w": `${markerWidth(shape, "sm")}px`, ...style } as React.CSSProperties) : style
  return (
    <section
      data-slot="launchpad"
      data-layout={timeline ? "timeline" : undefined}
      data-collapsed={isCollapsed || undefined}
      aria-labelledby={`${baseId}-title`}
      className={cn("flex flex-col rounded-xl bg-card shadow-card", className)}
      style={markerVar}
      {...props}
    >
      <header className="flex min-h-12 items-center gap-3 py-2.5 pr-2.5 pl-5">
        <h2 id={`${baseId}-title`} className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-foreground">
          <span aria-hidden className="size-1.5 shrink-0 rotate-45 rounded-[1px] bg-foreground" />
          {timeline ? (
            <SwapText swapKey={allDone ? "done" : "todo"} className="truncate">
              {allDone ? doneTitle : title}
            </SwapText>
          ) : (
            <span className="truncate">{title}</span>
          )}
        </h2>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="text-[12px] tabular-nums" aria-hidden>
            <span className="font-medium text-foreground">{timeline ? <AnimatedNumber value={doneCount} format={pad} /> : pad(doneCount)}</span>
            <span className="text-muted-foreground">/{pad(resolved.length)}</span>
          </span>
          <HeaderProgress type={progress} done={doneCount} total={resolved.length} />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={isCollapsed ? "Genişlet" : "Küçült"}
            aria-expanded={!isCollapsed}
            aria-controls={listId}
            onClick={() => setCollapsed(!isCollapsed)}
            className="-ml-1 text-icon hover:text-foreground aria-expanded:bg-transparent aria-expanded:hover:bg-muted"
          >
            {/* Points up while open (collapse), turns to point down once collapsed (expand). */}
            <motion.span
              aria-hidden
              className="flex"
              initial={false}
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={reduce ? INSTANT : ICON_SPRING}
            >
              <ChevronUpIcon />
            </motion.span>
          </Button>
          {allDone && onDismiss && (
            <Button variant="ghost" size="icon-sm" aria-label="Kapat" onClick={onDismiss} className="-ml-2 text-icon">
              <XIcon />
            </Button>
          )}
        </div>
      </header>

      {/* The up-next row opens as the list closes: two height springs, one motion. */}
      <Collapse open={isCollapsed && !!upNext} className="px-2.5 pb-2.5">
        {upNext && (
          <button
            type="button"
            onClick={() => (focusStep(upNext.id), setCollapsed(false))}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed px-2.5 py-2 text-left text-sm transition-colors duration-150 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            <span className="text-[13px] text-muted-foreground">Sıradaki</span>
            <span className="text-[12px] text-muted-foreground tabular-nums">{upNext.index}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{upNext.label}</span>
            {upNext.eta && <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{upNext.eta}</span>}
          </button>
        )}
      </Collapse>

      <Collapse open={!isCollapsed} id={listId}>
        <ol ref={listRef} onKeyDown={onListKeyDown} aria-label="Adımlar" className="flex flex-col border-t px-2.5 pt-2 pb-3">
          {resolved.map((step, i) => {
            const isActive = step.id === active && !allDone
            const isLast = i === resolved.length - 1
            const panelId = `${baseId}-step-${step.id}`
            const meta =
              step.status === "done" ? "tamamlandı"
              : step.status === "blocked" && step.waitingFor ? `${step.waitingFor.index} bitince`
              : step.eta
            return (
              <li key={step.id} data-status={step.status} className="relative">
                {!isLast && timeline && (
                  <RailSegment
                    filled={step.status === "done"}
                    delay={step.status === "done" ? 0.1 : 0}
                    className="top-[31px] -bottom-[5px] left-[calc(10px+var(--marker-w)/2-0.75px)]"
                  />
                )}
                {!isLast && !timeline && (
                  <span
                    aria-hidden
                    data-slot="launchpad-rail"
                    className={cn(
                      "absolute top-[29px] -bottom-[7px] left-[17.25px] border-l-[1.5px]",
                      step.status === "done" ? "border-solid border-foreground" : "border-dashed border-border-strong"
                    )}
                  />
                )}
                <button
                  type="button"
                  data-slot="launchpad-step-trigger"
                  aria-current={isActive ? "step" : undefined}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  onClick={() => focusStep(step.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/30"
                >
                  {timeline ? (
                    <StepMarker
                      status={step.status === "done" ? "done" : step.status === "blocked" ? "blocked" : isActive ? "current" : "upcoming"}
                      shape={shape}
                      size="sm"
                    />
                  ) : (
                    <StepNode status={step.status} active={isActive} shape={shape} />
                  )}
                  <span className="w-5 shrink-0 text-[12px] font-medium text-muted-foreground tabular-nums">{step.index}</span>
                  {timeline ? (
                    // The strike runs across the words only, not the empty space after them.
                    <span className="min-w-0 flex-1 text-sm">
                      <span
                        className={cn(
                          "bg-[linear-gradient(currentColor,currentColor)] bg-[position:0_58%] bg-no-repeat box-decoration-clone transition-[background-size,color] ease-out motion-reduce:transition-none",
                          step.status === "done" ? "bg-[length:100%_1px] text-muted-foreground delay-[60ms] duration-[360ms]"
                          : step.status === "blocked" && !isActive ? "bg-[length:0%_1px] text-muted-foreground duration-150"
                          : "bg-[length:0%_1px] font-medium text-foreground duration-150"
                        )}
                      >
                        {step.label}
                      </span>
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm",
                        step.status === "done" || (step.status === "blocked" && !isActive) ? "text-muted-foreground" : "font-medium text-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  )}
                  {meta &&
                    (timeline ? (
                      <SwapText className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{meta}</SwapText>
                    ) : (
                      <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{meta}</span>
                    ))}
                </button>
                <Collapse open={isActive} id={panelId}>
                  <div className={cn("flex flex-col gap-3 pr-2.5 pb-3", timeline ? "pl-[calc(var(--marker-w)+54px)]" : "pl-[70px]")}>
                    {step.description && <p className="max-w-prose text-[13px] text-muted-foreground">{step.description}</p>}
                    {step.status === "blocked" && step.waitingFor && (
                      <p className="text-[13px] text-foreground">
                        Önce <span className="font-medium tabular-nums">{step.waitingFor.index}</span> · {step.waitingFor.label} adımını tamamlayın.
                      </p>
                    )}
                    {step.actions && (
                      <fieldset disabled={step.status === "blocked"} className="flex min-w-0 flex-wrap items-center gap-2 disabled:opacity-60">
                        {step.actions}
                      </fieldset>
                    )}
                  </div>
                </Collapse>
              </li>
            )
          })}
        </ol>
        {timeline ? (
          <Collapse open={allDone}>
            <p role="status" className="-mt-1 px-5 pb-4 text-[13px] text-success-subtle-foreground">
              Tüm adımlar tamamlandı. Bu kartı kapatabilirsiniz.
            </p>
          </Collapse>
        ) : (
          allDone && (
            <p role="status" className="-mt-1 px-5 pb-4 text-[13px] text-success-subtle-foreground">
              Tüm adımlar tamamlandı. Bu kartı kapatabilirsiniz.
            </p>
          )
        )}
      </Collapse>
    </section>
  )
}

export { Launchpad, type LaunchpadProgressType, type LaunchpadProps, type LaunchpadStep, type LaunchpadStepStatus }
