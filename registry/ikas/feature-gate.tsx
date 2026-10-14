"use client"

import * as React from "react"
import { AnimatePresence, motion, useAnimate } from "motion/react"
import { CheckIcon, LockKeyholeIcon, LockKeyholeOpenIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { EASE_OUT, FADE_IN, FADE_OUT, ICON_SPRING, INSTANT } from "@/lib/motion"
import { Badge, type BadgeColor } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type FeatureGateVariant = "overlay" | "preview" | "banner" | "inline" | "action"
type FeatureGateColor = BadgeColor

type FeatureGateProps = {
  /** True while the plan does not include the feature. False renders `children` as they are. */
  locked: boolean
  /**
   * overlay blurs content the user already has; preview shows sample content when there is none yet;
   * banner keeps a section readable but read-only; inline swaps one control in a list; action wraps a single button.
   */
  variant?: FeatureGateVariant
  /** Feature name, next to the lock. */
  title: React.ReactNode
  /** One sentence on what the plan unlocks. */
  description?: React.ReactNode
  /** Plan that includes the feature, shown as a badge. */
  plan?: React.ReactNode
  /** Palette color of the lock, badge and upgrade button. */
  color?: FeatureGateColor
  /** Upgrade button text. Defaults to "Planı yükselt", or "Yükselt" in the compact variants. */
  upgradeLabel?: React.ReactNode
  /** Opens the plans or checkout. */
  onUpgrade?: () => void
  /** Secondary link text. */
  compareLabel?: React.ReactNode
  /** Shows the secondary link as a button. */
  onCompare?: () => void
  /** Shows the secondary link as an anchor. */
  compareHref?: string
  /** Sample content for variant="preview" while there is no real data. Defaults to `children`. */
  preview?: React.ReactNode
  /** The gated content. For variant="action", a single button. */
  children?: React.ReactNode
  className?: string
}

/** The text color the lock takes, and the soft fill the banner strip sits on. */
const tints = {
  neutral: "[--gate:var(--neutral-subtle-foreground)] [--gate-subtle:var(--neutral-subtle)] [--gate-border:var(--neutral-border)]",
  blue: "[--gate:var(--blue-subtle-foreground)] [--gate-subtle:var(--blue-subtle)] [--gate-border:var(--blue-border)]",
  violet: "[--gate:var(--violet-subtle-foreground)] [--gate-subtle:var(--violet-subtle)] [--gate-border:var(--violet-border)]",
  green: "[--gate:var(--green-subtle-foreground)] [--gate-subtle:var(--green-subtle)] [--gate-border:var(--green-border)]",
  lime: "[--gate:var(--lime-subtle-foreground)] [--gate-subtle:var(--lime-subtle)] [--gate-border:var(--lime-border)]",
  amber: "[--gate:var(--amber-subtle-foreground)] [--gate-subtle:var(--amber-subtle)] [--gate-border:var(--amber-border)]",
  red: "[--gate:var(--red-subtle-foreground)] [--gate-subtle:var(--red-subtle)] [--gate-border:var(--red-border)]",
} satisfies Record<FeatureGateColor, string>

const reducedQuery = "(prefers-reduced-motion: reduce)"

/** Live reduced-motion preference (motion's own hook keeps its first value). */
function useReducedMotion() {
  return React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(reducedQuery)
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia(reducedQuery).matches,
    () => false,
  )
}

type Phase = "locked" | "opening" | "open"

/** How long each unlock beat holds before the next one: the shackle lifts, then the check lands, then the content returns. */
const OPEN_MS = 260
const DONE_MS = 560

/**
 * Keeps the gate on screen for a short unlock sequence after `locked` turns false.
 * Locking again is immediate, and reduced motion skips the sequence.
 */
function useUnlock(locked: boolean, reduce: boolean) {
  const [shown, setShown] = React.useState(locked)
  const [phase, setPhase] = React.useState<Phase>(locked ? "locked" : "open")
  const [prev, setPrev] = React.useState(locked)

  if (locked !== prev) {
    setPrev(locked)
    if (locked || reduce) {
      setShown(locked)
      setPhase(locked ? "locked" : "open")
    } else {
      setPhase("opening")
    }
  }

  React.useEffect(() => {
    if (phase === "opening") {
      const timer = setTimeout(() => setPhase("open"), OPEN_MS)
      return () => clearTimeout(timer)
    }
    if (phase === "open" && shown && !locked) {
      const timer = setTimeout(() => setShown(false), DONE_MS - OPEN_MS)
      return () => clearTimeout(timer)
    }
  }, [phase, shown, locked])

  return { shown, phase }
}

/** Lock that drops into place once, swings when the gate is hovered and opens into a check on unlock. */
function GateLock({ phase, reduce, swing }: { phase: Phase; reduce: boolean; swing: number }) {
  const [scope, animate] = useAnimate<HTMLSpanElement>()

  React.useEffect(() => {
    if (!swing || reduce || !scope.current) return
    animate(scope.current, { rotate: [0, -9, 7, 0] }, { duration: 0.32, ease: EASE_OUT })
  }, [swing, reduce, animate, scope])

  const Icon = phase === "locked" ? LockKeyholeIcon : phase === "opening" ? LockKeyholeOpenIcon : CheckIcon

  return (
    <motion.span
      aria-hidden
      data-slot="feature-gate-lock"
      className={cn("relative grid size-4 shrink-0 place-items-center", phase === "open" ? "text-success-subtle-foreground" : "text-(--gate)")}
      initial={reduce ? false : { y: -6, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={reduce ? INSTANT : { ...ICON_SPRING, opacity: FADE_IN }}
    >
      <span ref={scope} className="grid size-4 place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={phase}
            className="absolute grid place-items-center"
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: INSTANT } : { scale: 0.6, opacity: 0, transition: FADE_OUT }}
            transition={reduce ? INSTANT : { ...ICON_SPRING, opacity: FADE_IN }}
          >
            <Icon className="size-4" />
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

/** Plan badge with one light sweep when the gate appears. */
function PlanBadge({ plan, color, reduce }: { plan: React.ReactNode; color: FeatureGateColor; reduce: boolean }) {
  return (
    <Badge data-slot="feature-gate-plan" color={color} size="sm" className="relative">
      {plan}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-[105deg] from-transparent from-35% via-card/80 via-50% to-transparent to-65%"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.25 }}
        />
      )}
    </Badge>
  )
}

type PartsProps = Required<Pick<FeatureGateProps, "plan" | "color" | "compareLabel">> &
  Pick<FeatureGateProps, "title" | "description" | "onUpgrade" | "onCompare" | "compareHref"> & {
    upgradeLabel: React.ReactNode
    phase: Phase
    reduce: boolean
    swing: number
    titleId: string
  }

function Heading({ title, plan, color, phase, reduce, swing, titleId, center }: PartsProps & { center?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", center && "justify-center")}>
      <GateLock phase={phase} reduce={reduce} swing={swing} />
      <h3 id={titleId} className="text-[15px] font-semibold text-foreground">
        {title}
      </h3>
      <PlanBadge plan={plan} color={color} reduce={reduce} />
    </div>
  )
}

/** The same pair as every other action row: outline for the secondary step, solid for the main one. */
function Actions({ upgradeLabel, onUpgrade, compareLabel, onCompare, compareHref, color, center }: PartsProps & { center?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 pt-1", center && "justify-center")}>
      {compareHref ? (
        <Button asChild variant="outline">
          <a href={compareHref}>{compareLabel}</a>
        </Button>
      ) : onCompare ? (
        <Button variant="outline" onClick={onCompare}>
          {compareLabel}
        </Button>
      ) : null}
      <Button color={color} onClick={onUpgrade}>
        {upgradeLabel}
      </Button>
    </div>
  )
}

/** Locks a feature that is outside the user's plan, without hiding that the feature exists. */
function FeatureGate({
  locked,
  variant = "overlay",
  title,
  description,
  plan = "Pro",
  color = "violet",
  upgradeLabel,
  onUpgrade,
  compareLabel = "Planları karşılaştır",
  onCompare,
  compareHref,
  preview,
  children,
  className,
}: FeatureGateProps) {
  const reduce = useReducedMotion()
  const sequenced = variant === "overlay" || variant === "preview"
  const { shown, phase } = useUnlock(locked, reduce || !sequenced)
  const [swing, setSwing] = React.useState(0)
  const titleId = React.useId()

  const parts: PartsProps = {
    title,
    description,
    plan,
    color,
    upgradeLabel: upgradeLabel ?? (variant === "overlay" || variant === "action" ? "Planı yükselt" : "Yükselt"),
    onUpgrade,
    compareLabel,
    onCompare,
    compareHref,
    phase,
    reduce,
    swing,
    titleId,
  }

  // Swing the lock on a fine pointer only; touch has no hover to answer.
  const onPointerEnter = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") setSwing((n) => n + 1)
  }

  const root = (extra?: string) => ({
    "data-slot": "feature-gate",
    "data-variant": variant,
    "data-locked": shown || undefined,
    className: cn(tints[color], extra, className),
  })

  if (variant === "inline") {
    return (
      <span {...root("inline-flex items-center")}>
        {shown ? (
          <span className="inline-flex items-center gap-2">
            <PlanBadge plan={plan} color={color} reduce={reduce} />
            <Button size="sm" variant="outline" aria-label={typeof title === "string" ? `${title}: ${parts.upgradeLabel}` : undefined} onClick={onUpgrade}>
              {parts.upgradeLabel}
            </Button>
          </span>
        ) : (
          children
        )}
      </span>
    )
  }

  if (variant === "action") {
    if (!shown || !React.isValidElement<{ children?: React.ReactNode; onClick?: unknown }>(children)) return <>{children}</>
    // The button's own action waits for the plan; while locked a click explains the plan instead.
    const trigger = React.cloneElement(
      children,
      { onClick: undefined },
      children.props.children,
      <LockKeyholeIcon key="feature-gate-lock" data-icon="inline-end" data-anim="wiggle" className="text-(--gate)" />,
    )
    return (
      <Popover>
        <PopoverTrigger asChild {...root()}>
          {trigger}
        </PopoverTrigger>
        <PopoverContent align="start" aria-labelledby={titleId} className={cn(tints[color], "w-80 gap-2.5 p-3.5")}>
          <Heading {...parts} />
          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
          <Actions {...parts} />
        </PopoverContent>
      </Popover>
    )
  }

  if (variant === "banner") {
    return (
      <div {...root()}>
        <AnimatePresence initial={false}>
          {shown && (
            <motion.div
              data-slot="feature-gate-banner"
              role="region"
              aria-labelledby={titleId}
              className="flex items-center gap-2.5 overflow-hidden border-b border-(--gate-border) bg-(--gate-subtle) px-4 py-2.5"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0, transition: INSTANT } : { opacity: 0, transition: FADE_OUT }}
            >
              <LockKeyholeIcon aria-hidden className="size-4 shrink-0 text-(--gate)" />
              <p className="min-w-0 flex-1 text-[13px] text-(--gate)">
                <span id={titleId} className="font-medium">
                  {title}
                </span>
                {description && <> · {description}</>}
              </p>
              <Button size="sm" color={color} onClick={onUpgrade}>
                {parts.upgradeLabel}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <div data-slot="feature-gate-content" inert={shown} className={cn(shown && "select-none [&_input]:text-muted-foreground")}>
          {children}
        </div>
      </div>
    )
  }

  if (variant === "preview") {
    return (
      <div {...root("relative")} onPointerEnter={onPointerEnter}>
        {shown ? (
          <div data-slot="feature-gate-preview" inert aria-hidden className="pointer-events-none min-h-60 mask-b-from-15% mask-b-to-80% select-none">
            {preview ?? children}
          </div>
        ) : (
          children
        )}
        <AnimatePresence>
          {shown && (
            <motion.div
              role="region"
              aria-labelledby={titleId}
              className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-x-4 gap-y-3 p-4"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: INSTANT } : { opacity: 0, transition: FADE_OUT }}
              transition={reduce ? INSTANT : { duration: 0.3, ease: EASE_OUT }}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Heading {...parts} />
                {description && <p className="pl-6 text-[13px] text-muted-foreground">{description}</p>}
              </div>
              <Button color={color} onClick={onUpgrade}>
                {parts.upgradeLabel}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div {...root("relative isolate")} onPointerEnter={onPointerEnter}>
      <div
        data-slot="feature-gate-content"
        inert={shown}
        aria-hidden={shown || undefined}
        className={cn(
          "transition-[filter,opacity] duration-300 ease-(--ease-out) motion-reduce:transition-none",
          shown && "pointer-events-none min-h-60 opacity-70 blur-[5px] select-none",
          phase === "open" && shown && "opacity-100 blur-none",
        )}
      >
        {children}
      </div>
      <AnimatePresence>
        {shown && (
          <motion.div
            role="region"
            aria-labelledby={titleId}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 bg-[radial-gradient(ellipse_at_center,var(--card)_30%,color-mix(in_oklab,var(--card)_72%,transparent)_62%,transparent)] p-6 text-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: INSTANT } : { opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
            transition={reduce ? INSTANT : FADE_IN}
          >
            <Heading {...parts} center />
            {description && <p className="max-w-xs text-[13px] text-muted-foreground">{description}</p>}
            <Actions {...parts} center />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { FeatureGate, type FeatureGateProps, type FeatureGateVariant, type FeatureGateColor }
