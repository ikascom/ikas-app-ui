"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { FADE_IN, FADE_OUT, INSTANT, springOrInstant } from "@/lib/motion"

type CollapseProps = {
  open: boolean
  children: React.ReactNode
  /** Classes for the inner content wrapper. Put padding here, not on the animated element. */
  className?: string
  /** id of the panel, for the trigger's aria-controls. */
  id?: string
}

/**
 * The parent's row gap when it stacks its children (flex column or grid).
 * A mounted-but-0px Collapse still gets that gap; when it unmounts after the
 * exit animation the gap vanishes at once, which reads as a second jump.
 */
function useParentRowGap(ref: React.RefObject<HTMLElement | null>) {
  const [gap, setGap] = React.useState(0)

  React.useLayoutEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const style = getComputedStyle(parent)
    const stacks = (style.display.includes("flex") && style.flexDirection.startsWith("column")) || style.display.includes("grid")
    setGap(stacks ? parseFloat(style.rowGap) || 0 : 0)
  }, [ref])

  return gap
}

function CollapsePanel({ children, className, id }: Omit<CollapseProps, "open">) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const gap = useParentRowGap(ref)

  return (
    <motion.div
      ref={ref}
      id={id}
      data-slot="collapse"
      initial={{ height: 0, overflow: "hidden" }}
      animate={{ height: "auto", transitionEnd: { overflow: "visible" } }}
      exit={{ height: 0, overflow: "hidden" }}
      transition={springOrInstant(reduce)}
      // Absorb the parent's gap into the animated height: the panel pulls itself
      // up by the gap and pads it back inside, so open and close are one motion.
      style={{ marginTop: -gap }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: reduce ? INSTANT : FADE_IN }}
        exit={{ opacity: 0, transition: reduce ? INSTANT : FADE_OUT }}
        style={{ paddingTop: gap }}
      >
        <div className={className}>{children}</div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Animates height between 0 and auto. Content fades in after the space opens
 * and out before it closes. Works inside gapped stacks (Card, FieldGroup) without
 * a jump at the end. Pair the trigger's aria-expanded / aria-controls with `id`.
 */
function Collapse({ open, children, className, id }: CollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <CollapsePanel key="collapse" className={className} id={id}>
          {children}
        </CollapsePanel>
      )}
    </AnimatePresence>
  )
}

export { Collapse, type CollapseProps }
