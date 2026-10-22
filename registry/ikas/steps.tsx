"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Collapse } from "@/components/ikas/collapse"
import { SwapText } from "@/components/ikas/swap-text"
import { StepConnector, StepMarker, markerWidth, useStepMarkerShape, useStepTravel, type StepMarkerShape, type StepStatus } from "@/components/ikas/step-kit"

type StepsItem = {
  id: string
  label: string
  /** Shown under the current step (vertical), or in the caption on narrow screens. One sentence. */
  description?: React.ReactNode
  /** Set while the step failed. Turns the marker red and replaces the description. */
  error?: React.ReactNode
}

type StepsProps = Omit<React.ComponentProps<"div">, "children"> & {
  steps: StepsItem[]
  /** Index of the current step. `steps.length` means every step is done. */
  current: number
  /** horizontal for wizards (3–6 steps), vertical for long flows with descriptions, compact for a wizard's header. */
  orientation?: "horizontal" | "vertical" | "compact"
  /** diamond (default), circle, square or pill. Defaults to the StepMarkerProvider's. */
  marker?: StepMarkerShape
  /** Shown under the current step in the vertical layout, e.g. its primary button. */
  actions?: React.ReactNode
  /** Accessible name of the list. */
  label?: string
  /** Announced and shown when every step is done. */
  completeLabel?: string
}

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Where the user is in an ordered flow. Jumping over several steps fills the connectors one after
 * another; the current step's halo lands last. Announces each change politely.
 */
function Steps({
  steps,
  current,
  orientation = "horizontal",
  marker,
  actions,
  label = "Adımlar",
  completeLabel = "Tüm adımlar tamamlandı",
  className,
  style,
  ...props
}: StepsProps) {
  const shape = useStepMarkerShape(marker)
  const travel = useStepTravel(current)
  const n = steps.length
  const done = current >= n
  const at = Math.min(current, n - 1)
  const statusOf = (i: number): StepStatus => (i < current ? "done" : i === current ? (steps[i].error ? "error" : "current") : "upcoming")
  const markerDelay = (i: number) => (statusOf(i) === "done" ? travel.delay(i) : travel.landing)
  const announce = done ? completeLabel : `${n} adımdan ${current + 1}. adım: ${steps[at].label}${steps[at].error ? ", hata" : ""}`
  const vars = { "--marker-w": `${markerWidth(shape, orientation === "compact" ? "sm" : "default")}px`, ...style } as React.CSSProperties
  const srStatus = (i: number) => ({ done: ", tamamlandı", error: ", hata", current: ", şu anki adım", upcoming: "", blocked: "" })[statusOf(i)]

  const live = (
    <span role="status" aria-live="polite" className="sr-only">
      {announce}
    </span>
  )

  if (orientation === "compact") {
    return (
      <div data-slot="steps" data-orientation="compact" className={cn("flex flex-col gap-2.5", className)} style={vars} {...props}>
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={at + 1}
          aria-valuetext={announce}
          className="flex items-center"
        >
          {steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <StepMarker status={statusOf(i)} shape={shape} size="sm" delay={markerDelay(i)} />
              {i < n - 1 && <StepConnector filled={i < current} delay={travel.delay(i)} className="mx-1.5 flex-1" />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-baseline justify-between gap-3 text-[12.5px] text-muted-foreground">
          <span className="tabular-nums">
            Adım <span className="font-medium text-foreground">{done ? n : at + 1}</span> / {n}
          </span>
          <SwapText direction={travel.forward ? 1 : -1} className="truncate font-medium text-foreground">
            {done ? completeLabel : steps[at].label}
          </SwapText>
        </div>
        {live}
      </div>
    )
  }

  if (orientation === "vertical") {
    return (
      <div data-slot="steps" data-orientation="vertical" className={cn("flex flex-col", className)} style={vars} {...props}>
        <ol aria-label={label} className="flex flex-col">
          {steps.map((step, i) => {
            const status = statusOf(i)
            const isCurrent = i === current
            return (
              <li
                key={step.id}
                data-status={status}
                aria-current={isCurrent ? "step" : undefined}
                className="relative grid grid-cols-[var(--marker-w)_minmax(0,1fr)] gap-x-3.5 pb-[18px] last:pb-0"
              >
                {i < n - 1 && (
                  <StepConnector
                    orientation="vertical"
                    filled={i < current}
                    delay={travel.delay(i)}
                    className="absolute top-[30px] bottom-1 left-[calc(var(--marker-w)/2-0.75px)]"
                  />
                )}
                <StepMarker status={status} index={i + 1} shape={shape} delay={markerDelay(i)} />
                <div className="flex min-w-0 flex-col pt-[3px]">
                  <span
                    className={cn(
                      "text-sm transition-colors duration-200 ease-out",
                      status === "upcoming" ? "text-muted-foreground" : "font-medium text-foreground"
                    )}
                  >
                    {step.label}
                    <span className="sr-only">{srStatus(i)}</span>
                  </span>
                  <Collapse open={isCurrent && !!(step.error || step.description || actions)}>
                    <div className="flex flex-col gap-2 pt-1">
                      {(step.error || step.description) && (
                        <SwapText swapKey={step.error ? "error" : "description"} className={cn("text-[13px]", step.error ? "text-red-subtle-foreground" : "text-muted-foreground")}>
                          <span role={step.error ? "alert" : undefined}>{step.error ?? step.description}</span>
                        </SwapText>
                      )}
                      {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
                    </div>
                  </Collapse>
                </div>
              </li>
            )
          })}
        </ol>
        {live}
      </div>
    )
  }

  return (
    <div data-slot="steps" data-orientation="horizontal" className={cn("@container flex flex-col gap-3", className)} style={vars} {...props}>
      <ol aria-label={label} className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {steps.map((step, i) => {
          const status = statusOf(i)
          return (
            <li
              key={step.id}
              data-status={status}
              aria-current={i === current ? "step" : undefined}
              className="relative flex min-w-0 flex-col items-start gap-2.5 pr-2.5 last:pr-0"
            >
              {i < n - 1 && (
                <StepConnector filled={i < current} delay={travel.delay(i)} className="absolute top-[12.25px] right-2.5 left-[calc(var(--marker-w)+12px)]" />
              )}
              <StepMarker status={status} index={i + 1} shape={shape} delay={markerDelay(i)} />
              <span className="flex min-w-0 max-w-full flex-col gap-px @max-md:sr-only">
                <span
                  className={cn(
                    "truncate text-[13px] transition-colors duration-200 ease-out",
                    status === "upcoming" ? "text-muted-foreground" : status === "error" ? "font-medium text-red-subtle-foreground" : "font-medium text-foreground"
                  )}
                >
                  {step.label}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{pad(i + 1)}</span>
                <span className="sr-only">{srStatus(i)}</span>
              </span>
            </li>
          )
        })}
      </ol>
      {/* Narrow containers drop the labels under the markers and name the current step here instead. */}
      <div aria-hidden className="hidden text-[13px] @max-md:block">
        <SwapText direction={travel.forward ? 1 : -1} swapKey={done ? "done" : `${at}:${steps[at].error ? "e" : ""}`}>
          {done ? (
            <span className="font-medium">{completeLabel}</span>
          ) : (
            <span>
              <span className="font-medium">
                {pad(at + 1)} · {steps[at].label}
              </span>{" "}
              <span className="text-muted-foreground">{steps[at].error ?? steps[at].description}</span>
            </span>
          )}
        </SwapText>
      </div>
      {live}
    </div>
  )
}

export { Steps, type StepsItem, type StepsProps }
