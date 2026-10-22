"use client"

import * as React from "react"
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react"

import { EASE_OUT } from "@/lib/motion"
import { cn } from "@/lib/utils"

type SwapTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  /** The text to show. A change animates; the same text again does nothing. */
  children: React.ReactNode
  /** Identity of the text when `children` is not a string, e.g. a step id. Defaults to the string itself. */
  swapKey?: React.Key
  /** 1: the new text rises from below (values going up, moving forward). -1: it drops from above. */
  direction?: 1 | -1
}

/** Outgoing copies are hidden from assistive tech while they fade. */
function Outgoing(props: React.ComponentProps<typeof motion.span>) {
  const present = useIsPresent()
  return <motion.span {...props} aria-hidden={present ? undefined : true} />
}

/**
 * Text that changes in place: the new line rises 0.3em out of a 4px blur while the old one
 * leaves the other way, faster. Use for labels, step names and hints that change with state.
 */
function SwapText({ children, swapKey, direction = 1, className, ...props }: SwapTextProps) {
  const reduce = useReducedMotion()
  const key = swapKey ?? (typeof children === "string" || typeof children === "number" ? children : undefined)

  return (
    <span data-slot="swap-text" className={cn("relative inline-flex min-w-0", className)} {...props}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <Outgoing
          key={key ?? "swap-text"}
          custom={direction}
          className="inline-block min-w-0"
          variants={{
            enter: (dir: number) => (reduce ? { opacity: 0 } : { opacity: 0, y: `${0.3 * dir}em`, filter: "blur(4px)" }),
            center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: reduce ? 0.12 : 0.2, ease: EASE_OUT } },
            exit: (dir: number) =>
              reduce
                ? { opacity: 0, transition: { duration: 0.1 } }
                : { opacity: 0, y: `${-0.3 * dir}em`, filter: "blur(2px)", transition: { duration: 0.12, ease: EASE_OUT } },
          }}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {children}
        </Outgoing>
      </AnimatePresence>
    </span>
  )
}

export { SwapText, type SwapTextProps }
