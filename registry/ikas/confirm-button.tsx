"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { EASE_OUT, INSTANT, SPRING } from "@/lib/motion"
import { Button, type ButtonProps } from "@/components/ui/button"

type ConfirmButtonProps = Omit<ButtonProps, "onClick" | "asChild"> & {
  /** Runs on the second click while armed. */
  onConfirm: () => void
  /** Label shown while armed. */
  confirmLabel?: React.ReactNode
  /** How long the button stays armed, in ms. */
  timeout?: number
}

/**
 * Two-step inline confirm for destructive actions that do not deserve a dialog.
 * First click arms it (red, new label), a second click within `timeout` confirms.
 */
function ConfirmButton({ onConfirm, confirmLabel = "Emin misiniz?", timeout = 3000, children, variant = "outline", color, onBlur, className, ...props }: ConfirmButtonProps) {
  const [armed, setArmed] = React.useState(false)
  const reduce = useReducedMotion()
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  function handleClick() {
    clearTimeout(timer.current)
    if (armed) {
      setArmed(false)
      onConfirm()
      return
    }
    setArmed(true)
    timer.current = setTimeout(() => setArmed(false), timeout)
  }

  const offset = reduce ? 0 : 8

  return (
    <Button
      {...props}
      variant={armed ? "solid" : variant}
      color={armed ? "red" : color}
      aria-live="polite"
      data-armed={armed || undefined}
      onClick={handleClick}
      onBlur={(event) => {
        onBlur?.(event)
        clearTimeout(timer.current)
        setArmed(false)
      }}
      className={cn("overflow-hidden", className)}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={armed ? "armed" : "idle"}
          initial={{ y: offset, opacity: 0, filter: reduce ? "blur(0px)" : "blur(2px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)", transition: reduce ? INSTANT : SPRING }}
          exit={{ y: -offset, opacity: 0, filter: reduce ? "blur(0px)" : "blur(2px)", transition: reduce ? INSTANT : { duration: 0.12, ease: EASE_OUT } }}
          className="inline-flex items-center gap-[inherit]"
        >
          {armed ? confirmLabel : children}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

export { ConfirmButton, type ConfirmButtonProps }
