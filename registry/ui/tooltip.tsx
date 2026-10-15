"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Kbd } from "@/components/ui/kbd"

/**
 * Put one at the root. The first tooltip waits for intent; once one has been open, its neighbours
 * open at once until the pointer has been away for `skipDelayDuration`.
 */
function TooltipProvider({ delayDuration = 400, skipDelayDuration = 300, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /** Keyboard shortcut shown after the label, e.g. "⌘K". Only for a real shortcut. */
  shortcut?: React.ReactNode
}

/**
 * The bubble grows from the edge that faces its trigger: 125ms on the reveal curve, out in 100ms with a fade only.
 * A neighbour or keyboard focus opens it instantly (Radix's `instant-open`) with no motion, and the bubble it
 * replaces disappears at once instead of fading under the new one. Reduced motion keeps the fade and drops the scale.
 */
function TooltipContent({ className, sideOffset = 6, shortcut, children, ...props }: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex w-fit max-w-70 origin-(--radix-tooltip-content-transform-origin) items-center gap-2 rounded-lg bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-[0_2px_6px_0_var(--shade-2)] select-none has-data-[slot=kbd]:pr-1.5",
          "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-96 data-[state=delayed-open]:duration-125 data-[state=delayed-open]:ease-(--ease-reveal)",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-100 data-[state=closed]:ease-(--ease-out)",
          // The bubble a neighbour replaces goes invisible at once but keeps its exit running: Radix unmounts on animationend,
          // and removing the animation instead would leave it mounted.
          "data-[state=instant-open]:animate-none [body:has([data-slot=tooltip-content][data-state=instant-open])_&]:data-[state=closed]:opacity-0",
          "motion-reduce:data-[state=delayed-open]:zoom-in-100 motion-reduce:data-[state=delayed-open]:duration-100",
          className,
        )}
        {...props}
      >
        {children}
        {shortcut != null && <Kbd>{shortcut}</Kbd>}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type TooltipContentProps }
