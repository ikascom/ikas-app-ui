"use client"

import * as React from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { springOrInstant } from "@/lib/motion"

type ActionBarItem = {
  id: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  /** Small counter shown next to the icon, e.g. drafts waiting. */
  badge?: number
  /** "solid" is the one main action of the bar. Use at most once. */
  variant?: "ghost" | "solid"
  disabled?: boolean
}

type ActionBarProps = {
  items: ActionBarItem[]
  /** Accessible name of the toolbar. */
  label: string
  className?: string
}

/** Icon toolbar whose labels open on hover or keyboard focus. Saves room in dense headers. */
function ActionBar({ items, label, className }: ActionBarProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [hovered, setHovered] = React.useState<string | null>(null)
  const reduce = useReducedMotion()
  const groupId = React.useId()
  const collapseTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  function open() {
    clearTimeout(collapseTimer.current)
    setExpanded(true)
  }

  function scheduleClose() {
    clearTimeout(collapseTimer.current)
    collapseTimer.current = setTimeout(() => {
      setExpanded(false)
      setHovered(null)
    }, 90)
  }

  React.useEffect(() => () => clearTimeout(collapseTimer.current), [])

  return (
    <LayoutGroup id={groupId}>
      <div
        role="toolbar"
        aria-label={label}
        data-slot="action-bar"
        onPointerEnter={open}
        onPointerLeave={scheduleClose}
        onFocus={open}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) scheduleClose()
        }}
        className={cn(
          "inline-flex h-9 w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-foreground/[0.05] p-[3px] shadow-[inset_0_1px_2px_0_var(--shade-1)] [scrollbar-width:none]",
          className
        )}
      >
        {items.map((item) => {
          const solid = item.variant === "solid"
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.badge ? `${item.label} (${item.badge})` : item.label}
              disabled={item.disabled}
              onClick={item.onClick}
              onPointerEnter={() => setHovered(item.id)}
              onFocus={() => setHovered(item.id)}
              className={cn(
                "group/action relative isolate inline-flex h-[30px] min-w-[30px] shrink-0 items-center justify-center rounded-md px-[8px] text-[13px] font-medium whitespace-nowrap outline-none transition-[color,scale] duration-150 ease-out focus-visible:ring-3 focus-visible:ring-ring/30 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:active:scale-100 [&_svg]:size-3.5 [&_svg]:shrink-0",
                solid
                  ? "bg-(--c) bg-linear-to-b from-white/14 to-transparent text-(--c-fg) shadow-solid [--c-fg:var(--neutral-foreground)] [--c:var(--neutral)] hover:shadow-solid-hover"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {!solid && hovered === item.id && (
                <motion.span
                  layoutId="action-bar-highlight"
                  aria-hidden
                  transition={springOrInstant(reduce)}
                  className="absolute inset-0 -z-10 rounded-md bg-card shadow-raised"
                />
              )}
              {item.icon}
              <motion.span
                aria-hidden={!expanded}
                initial={false}
                animate={{
                  width: expanded ? "auto" : 0,
                  opacity: expanded ? 1 : 0,
                  x: expanded ? 0 : -4,
                  marginLeft: expanded ? 6 : 0,
                  filter: expanded ? "blur(0px)" : "blur(3px)",
                }}
                transition={springOrInstant(reduce)}
                className="overflow-hidden"
              >
                {item.label}
              </motion.span>
              {item.badge ? (
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] tabular-nums transition-[margin] duration-150",
                    solid ? "ml-1.5 bg-white/20" : "ml-1.5 bg-foreground text-background"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

export { ActionBar, type ActionBarItem, type ActionBarProps }
