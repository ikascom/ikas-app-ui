"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { ChevronDownIcon, XIcon } from "lucide-react"

import { springOrInstant } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AnimatedCheckIcon } from "@/components/ikas/animated-check"
import { Collapse } from "@/components/ikas/collapse"

type SetupStep = {
  id: string
  title: React.ReactNode
  description?: React.ReactNode
  /** Buttons for the step, shown while it is open. Primary first. */
  action?: React.ReactNode
  done: boolean
}

type SetupGuideProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  steps: SetupStep[]
  /** Shows a dismiss button. Usually offered once every step is done. */
  onDismiss?: () => void
  className?: string
}

/**
 * First-run checklist. Opens the first unfinished step, ticks steps off with a
 * drawn check and fills the progress bar as the merchant goes. The guide most
 * ikas apps need right after install: connect, configure, install script, test.
 */
function SetupGuide({ title = "Kurulum rehberi", description, steps, onDismiss, className }: SetupGuideProps) {
  const reduce = useReducedMotion()
  const firstOpen = steps.find((s) => !s.done)?.id ?? null
  const [openId, setOpenId] = React.useState<string | null>(firstOpen)
  const doneCount = steps.filter((s) => s.done).length
  const allDone = doneCount === steps.length

  // When a step is completed, move on to the next unfinished one.
  const [lastFirstOpen, setLastFirstOpen] = React.useState(firstOpen)
  if (firstOpen !== lastFirstOpen) {
    setLastFirstOpen(firstOpen)
    setOpenId(firstOpen)
  }

  return (
    <section data-slot="setup-guide" className={cn("flex flex-col rounded-xl bg-card shadow-card", className)}>
      <header className="flex items-start gap-4 p-5 pb-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground tabular-nums">
              {doneCount} / {steps.length} tamamlandı
            </span>
            <div className="h-1.5 max-w-48 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={doneCount} aria-label="Kurulum ilerlemesi">
              <motion.div
                className="h-full rounded-full bg-foreground"
                initial={false}
                animate={{ width: `${(doneCount / steps.length) * 100}%` }}
                transition={springOrInstant(reduce)}
              />
            </div>
          </div>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon-sm" aria-label="Rehberi kapat" onClick={onDismiss} className="-mt-1 -mr-1 text-icon">
            <XIcon />
          </Button>
        )}
      </header>

      <ol className="flex flex-col border-t px-2 py-2">
        {steps.map((step) => {
          const open = openId === step.id && !allDone
          return (
            <li key={step.id} className={cn("rounded-lg transition-colors duration-150", open && "bg-muted/60")}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={`setup-step-${step.id}`}
                onClick={() => setOpenId(open ? null : step.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-150",
                    step.done ? "bg-foreground text-background" : "border-[1.5px] border-dashed border-border-strong"
                  )}
                >
                  {step.done && <AnimatedCheckIcon className="size-3" />}
                </span>
                <span className={cn("flex-1 text-sm", step.done ? "text-muted-foreground line-through decoration-foreground/20" : "font-medium")}>
                  {step.title}
                  <span className="sr-only">{step.done ? " (tamamlandı)" : ""}</span>
                </span>
                <ChevronDownIcon className={cn("size-4 text-icon transition-transform duration-200", open && "rotate-180")} />
              </button>
              <Collapse open={open} id={`setup-step-${step.id}`}>
                <div className="flex flex-col gap-3 pr-3 pb-3 pl-11">
                  {step.description && <p className="text-[13px] text-muted-foreground">{step.description}</p>}
                  {step.action && <div className="flex flex-wrap items-center gap-2">{step.action}</div>}
                </div>
              </Collapse>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export { SetupGuide, type SetupGuideProps, type SetupStep }
