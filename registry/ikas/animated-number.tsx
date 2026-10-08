"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { springOrInstant } from "@/lib/motion"

const defaultFormat = new Intl.NumberFormat("tr-TR").format

type AnimatedNumberProps = Omit<React.ComponentProps<"span">, "children"> & {
  value: number
  /** Formats the number for display. Defaults to tr-TR grouping. */
  format?: (value: number) => string
}

/**
 * A number that rolls when it changes: increases come up from below,
 * decreases drop from above, so the direction is readable at a glance.
 */
function AnimatedNumber({ value, format = defaultFormat, className, ...props }: AnimatedNumberProps) {
  const reduce = useReducedMotion()
  // Derive direction during render (React's "adjust state on prop change" pattern).
  const [previous, setPrevious] = React.useState(value)
  const [direction, setDirection] = React.useState(0)
  if (value !== previous) {
    setDirection(value > previous ? 1 : -1)
    setPrevious(value)
  }

  const offset = reduce ? 0 : 10

  return (
    <span data-slot="animated-number" className={cn("relative inline-flex overflow-hidden tabular-nums", className)} {...props}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ y: offset * dir, opacity: 0 }),
            center: { y: 0, opacity: 1 },
            exit: (dir: number) => ({ y: -offset * dir, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springOrInstant(reduce)}
          className="inline-block"
        >
          {format(value)}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export { AnimatedNumber, type AnimatedNumberProps }
