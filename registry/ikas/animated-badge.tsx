"use client"

import * as React from "react"
import { AnimatePresence, motion, type Transition } from "motion/react"
import type { VariantProps } from "class-variance-authority"
import { CircleIcon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { EASE_OUT, FADE_IN, FADE_OUT, ICON_SPRING, SPRING, usePrefersReducedMotion } from "@/lib/motion"
import { badgeVariants, type BadgeColor, type BadgeStatus } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { AnimatedCheckIcon } from "@/components/ikas/animated-check"

type AnimatedBadgeStatus = BadgeStatus | "loading"
type AnimatedBadgeMedia = "icon" | "dot" | "none"

type AnimatedBadgeProps = Omit<
  React.ComponentProps<"span">,
  "color" | "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
> &
  Pick<VariantProps<typeof badgeVariants>, "variant" | "size"> & {
    /** Semantic status. loading keeps the neutral tint and spins. Changing it rolls the icon and label. */
    status?: AnimatedBadgeStatus
    /** Raw palette color; wins over `status`. */
    color?: BadgeColor
    /** icon shows the status glyph, dot the quiet list dot, none only the label. */
    media?: AnimatedBadgeMedia
    /** Replaces the status glyph. Give it a `key` that changes with the status so it rolls. */
    icon?: React.ReactNode
    /** Opens a ring from the dot every 1.6s. For live states only; loading spins instead. */
    pulse?: boolean
    /** Identity of the label. Defaults to the text, so the same text with a new meaning needs a key. */
    contentKey?: string | number
    /** The label. Only the parts that change roll: pass an array to roll a number but keep its unit. */
    children?: React.ReactNode | React.ReactNode[]
  }

/** Same mapping as Badge; the type is exported there, the table is not. */
const statusColor: Record<AnimatedBadgeStatus, BadgeColor> = {
  neutral: "neutral",
  info: "blue",
  success: "green",
  warning: "amber",
  danger: "red",
  loading: "neutral",
}

const glyphs: Record<Exclude<AnimatedBadgeStatus, "success" | "loading">, React.ComponentType<{ className?: string }>> = {
  neutral: CircleIcon,
  info: InfoIcon,
  warning: TriangleAlertIcon,
  danger: XIcon,
}

const blur = "blur(2px)"
const sharp = "blur(0px)"
/** Reduced motion swaps in place: a short crossfade keeps the change legible without movement. */
const REDUCED_FADE: Transition = { duration: 0.12, ease: EASE_OUT }

/** The leaving label rides up and out while the next one comes up from below. Full transform strings stay off the main thread. */
const roll = (reduce: boolean) =>
  reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0, transition: REDUCED_FADE }, transition: REDUCED_FADE }
    : {
        initial: { transform: "translateY(90%)", opacity: 0, filter: blur },
        animate: { transform: "translateY(0%)", opacity: 1, filter: sharp },
        exit: { transform: "translateY(-90%)", opacity: 0, filter: blur, transition: FADE_OUT },
        transition: { transform: SPRING, opacity: FADE_IN, filter: FADE_IN },
      }

/** Glyphs trade places in the slot: the old one shrinks and blurs away, the next one lands on the icon spring. */
const pop = (reduce: boolean, drawn: boolean) =>
  reduce
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0, transition: REDUCED_FADE }, transition: REDUCED_FADE }
    : {
        // A self-drawing check scales itself, so its wrapper only fades in.
        initial: { transform: drawn ? "scale(1)" : "scale(0.8)", opacity: 0, filter: blur },
        animate: { transform: "scale(1)", opacity: 1, filter: sharp },
        exit: { transform: "scale(0.8)", opacity: 0, filter: blur, transition: FADE_OUT },
        transition: { transform: ICON_SPRING, opacity: FADE_IN, filter: FADE_IN },
      }

function Glyph({ status, icon }: { status: AnimatedBadgeStatus; icon?: React.ReactNode }) {
  if (icon) return <>{icon}</>
  if (status === "loading") return <Spinner className="size-3" />
  if (status === "success") return <AnimatedCheckIcon className="size-3" />
  const Icon = glyphs[status]
  return <Icon className="size-3" />
}

/**
 * Badge whose icon, label and width animate when its status changes. The pill, colors
 * and sizes are Badge's own; motion only runs on a change, never on mount.
 */
function AnimatedBadge({
  status = "neutral",
  color,
  variant = "soft",
  size,
  media = "icon",
  icon,
  pulse = false,
  contentKey,
  children,
  className,
  ...props
}: AnimatedBadgeProps) {
  const reduce = usePrefersReducedMotion()
  const resolved = color ?? statusColor[status]
  const layout = reduce ? false : true
  const slot = reduce ? false : ("position" as const)
  const parts = React.Children.toArray(children).filter((part) => part !== "" && typeof part !== "boolean")
  const keyOf = (part: React.ReactNode, index: number) =>
    contentKey != null && parts.length === 1 ? contentKey : typeof part === "string" || typeof part === "number" ? part : `${status}-${index}`
  const glyphKey = icon ? `icon-${React.isValidElement(icon) && icon.key != null ? icon.key : status}` : `${status}`
  const ringing = pulse && media === "dot" && status !== "loading" && !reduce

  return (
    <motion.span
      layout={layout}
      transition={SPRING}
      data-slot="animated-badge"
      data-status={status}
      data-variant={variant}
      data-color={resolved}
      className={cn(
        badgeVariants({ variant, color: resolved, size }),
        "relative overflow-hidden transition-[background-color,color,box-shadow] duration-200 ease-linear",
        className,
      )}
      {...props}
    >
      {media !== "none" && (
        <motion.span layout={slot} transition={SPRING} className="relative grid size-3 shrink-0 place-items-center *:[grid-area:1/1]">
          {media === "dot" ? (
            <>
              <span aria-hidden className={cn("size-1.5 rounded-full", variant === "solid" ? "bg-current/80" : "bg-(--c-dot)")} />
              {ringing && (
                <motion.span
                  aria-hidden
                  className={cn("size-1.5 rounded-full ring-1", variant === "solid" ? "ring-current/80" : "ring-(--c-dot)")}
                  animate={{ transform: ["scale(1)", "scale(2.6)"], opacity: [0.9, 0] }}
                  transition={{ duration: 1.6, ease: EASE_OUT, repeat: Infinity }}
                />
              )}
            </>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={glyphKey} aria-hidden className="grid place-items-center" {...pop(reduce, !icon && status === "success")}>
                <Glyph status={status} icon={icon} />
              </motion.span>
            </AnimatePresence>
          )}
        </motion.span>
      )}
      {parts.length > 0 && (
        <motion.span layout={slot} transition={SPRING} className="inline-flex [clip-path:inset(-2px_-999px)]">
          {parts.map((part, index) => (
            <span key={index} className="relative grid *:[grid-area:1/1]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span key={keyOf(part, index)} className="block whitespace-pre" {...roll(reduce)}>
                  {part}
                </motion.span>
              </AnimatePresence>
            </span>
          ))}
        </motion.span>
      )}
    </motion.span>
  )
}

export { AnimatedBadge, type AnimatedBadgeProps, type AnimatedBadgeStatus, type AnimatedBadgeMedia }
