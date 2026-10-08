"use client"

import * as React from "react"
import { ChevronUpIcon, XIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { ICON_SPRING, INSTANT } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapse } from "@/components/ikas/collapse"

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
}

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

/** Step marker: a diamond. Filled when done, with a core while active, dashed while blocked. */
function StepNode({ status, active }: { status: LaunchpadStepStatus; active: boolean }) {
  const outline = "M8 1.6 14.4 8 8 14.4 1.6 8Z"
  return (
    <svg data-slot="launchpad-node" viewBox="0 0 16 16" className="size-4 shrink-0 overflow-visible" aria-hidden>
      {status === "done" ? (
        <path d={outline} className="fill-foreground stroke-foreground" strokeWidth={1.5} strokeLinejoin="round" />
      ) : active ? (
        <>
          <path d={outline} className="fill-card stroke-foreground" strokeWidth={1.5} strokeLinejoin="round" />
          <path d="M8 5.4 10.6 8 8 10.6 5.4 8Z" className="fill-foreground" />
        </>
      ) : (
        <path
          d={outline}
          className={cn("fill-card", status === "blocked" ? "stroke-border-strong" : "stroke-icon")}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeDasharray={status === "blocked" ? "2.4 2.1" : undefined}
        />
      )}
    </svg>
  )
}

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
  className,
  ...props
}: LaunchpadProps) {
  const baseId = React.useId()
  const reduce = useReducedMotion()
  const listRef = React.useRef<HTMLOListElement>(null)
  const resolved = React.useMemo(() => resolveSteps(steps), [steps])
  const doneCount = resolved.filter((s) => s.status === "done").length
  const allDone = resolved.length > 0 && doneCount === resolved.length
  const doneKey = resolved.map((s) => (s.status === "done" ? s.id : "")).join("|")

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

  return (
    <section
      data-slot="launchpad"
      data-collapsed={isCollapsed || undefined}
      aria-labelledby={`${baseId}-title`}
      className={cn("flex flex-col rounded-xl bg-card shadow-card", className)}
      {...props}
    >
      <header className="flex min-h-12 items-center gap-3 py-2.5 pr-2.5 pl-5">
        <h2 id={`${baseId}-title`} className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-foreground">
          <span aria-hidden className="size-1.5 shrink-0 rotate-45 rounded-[1px] bg-foreground" />
          <span className="truncate">{title}</span>
        </h2>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="text-[12px] tabular-nums" aria-hidden>
            <span className="font-medium text-foreground">{pad(doneCount)}</span>
            <span className="text-muted-foreground">/{pad(resolved.length)}</span>
          </span>
          <div
            role="progressbar"
            aria-label="Tamamlanan adımlar"
            aria-valuemin={0}
            aria-valuemax={resolved.length}
            aria-valuenow={doneCount}
            aria-valuetext={`${resolved.length} adımdan ${doneCount} tanesi tamamlandı`}
            className="flex items-center gap-[3px] pr-1"
          >
            {resolved.map((step) => (
              <span
                key={step.id}
                className={cn(
                  "h-2 w-2.5 -skew-x-[20deg] rounded-[1.5px] transition-colors duration-200 ease-(--ease-out) motion-reduce:transition-none",
                  step.status === "done" ? "bg-foreground" : step.id === active ? "bg-foreground/35" : "bg-border-strong"
                )}
              />
            ))}
          </div>
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
                {!isLast && (
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
                  <StepNode status={step.status} active={isActive} />
                  <span className="w-5 shrink-0 text-[12px] font-medium text-muted-foreground tabular-nums">{step.index}</span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 text-sm",
                      step.status === "done" || (step.status === "blocked" && !isActive) ? "text-muted-foreground" : "font-medium text-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {meta && (
                    <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">{meta}</span>
                  )}
                </button>
                <Collapse open={isActive} id={panelId}>
                  <div className="flex flex-col gap-3 pr-2.5 pb-3 pl-[70px]">
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
        {allDone && (
          <p role="status" className="-mt-1 px-5 pb-4 text-[13px] text-success-subtle-foreground">
            Tüm adımlar tamamlandı. Bu kartı kapatabilirsiniz.
          </p>
        )}
      </Collapse>
    </section>
  )
}

export { Launchpad, type LaunchpadProps, type LaunchpadStep, type LaunchpadStepStatus }
