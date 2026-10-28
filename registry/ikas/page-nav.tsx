"use client"

import * as React from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { springOrInstant } from "@/lib/motion"

type PageNavItem<T extends string = string> = {
  value: T
  label: React.ReactNode
  /** Link target. Used when PageNav has no `onValueChange` (router apps). */
  href?: string
  /** Count shown after the label, e.g. items waiting. */
  badge?: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

type PageNavProps<T extends string = string> = Omit<React.ComponentProps<"nav">, "onChange"> & {
  /** App sections in order. Keep it to six or fewer. */
  items: PageNavItem<T>[]
  /** Active section. With links, pass the one matching the current route. */
  value: T
  /** Switches sections in place (one-page apps): items become tabs. Omit it to render `href` links. */
  onValueChange?: (value: T) => void
  /** Component for `href` items, e.g. `next/link`. */
  linkComponent?: React.ElementType
}

/**
 * Second-level section bar at the top of a Page, under the panel's own top
 * bar. Links for router apps, tabs for one-page apps; the active item has a
 * sliding underline.
 */
function PageNav<T extends string>({
  items,
  value,
  onValueChange,
  linkComponent: Link = "a",
  className,
  "aria-label": ariaLabel = "Bölümler",
  ...props
}: PageNavProps<T>) {
  const id = React.useId()
  const reduce = useReducedMotion()
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const tabs = onValueChange !== undefined
  // A value that matches no enabled item still leaves one tab stop, so the keyboard can reach the bar.
  const focusable = items.find((item) => item.value === value && !item.disabled)?.value ?? items.find((item) => !item.disabled)?.value

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const enabled = items.flatMap((item, i) => (item.disabled ? [] : [i]))
    if (enabled.length === 0) return
    const at = enabled.indexOf(index)
    let next: number | undefined
    if (event.key === "ArrowRight") next = enabled[(at + 1) % enabled.length]
    if (event.key === "ArrowLeft") next = enabled[(at - 1 + enabled.length) % enabled.length]
    if (event.key === "Home") next = enabled[0]
    if (event.key === "End") next = enabled[enabled.length - 1]
    if (next === undefined) return
    event.preventDefault()
    refs.current[next]?.focus()
    onValueChange?.(items[next].value)
  }

  return (
    <LayoutGroup id={id}>
      <nav
        data-slot="page-nav"
        aria-label={tabs ? undefined : ariaLabel}
        className={cn("sticky top-0 z-10 -mx-4 border-b bg-background px-4 sm:-mx-6 sm:px-6", className)}
        {...props}
      >
        {/* The row overlaps the border by 1px so the underline sits on it. */}
        <div
          role={tabs ? "tablist" : undefined}
          aria-label={tabs ? ariaLabel : undefined}
          className="-mb-px flex gap-4 overflow-x-auto [scrollbar-width:none]"
        >
          {items.map((item, index) => {
            const active = item.value === value
            const itemClassName = cn(
              "relative flex h-11 shrink-0 items-center gap-1.5 rounded-md px-1 text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              item.disabled && "pointer-events-none opacity-50"
            )
            const content = (
              <>
                {active && (
                  <motion.span
                    layoutId="page-nav-underline"
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-foreground"
                    transition={springOrInstant(reduce)}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.icon}
                  {item.label}
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums transition-colors",
                        active ? "bg-foreground text-background" : "bg-foreground/10 text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>
              </>
            )

            if (tabs) {
              return (
                <button
                  key={item.value}
                  ref={(node) => {
                    refs.current[index] = node
                  }}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  tabIndex={item.value === focusable ? 0 : -1}
                  disabled={item.disabled}
                  onClick={() => onValueChange?.(item.value)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={itemClassName}
                >
                  {content}
                </button>
              )
            }
            if (item.disabled || !item.href) {
              return (
                <span key={item.value} aria-disabled="true" className={itemClassName}>
                  {content}
                </span>
              )
            }
            return (
              <Link key={item.value} href={item.href} aria-current={active ? "page" : undefined} className={itemClassName}>
                {content}
              </Link>
            )
          })}
        </div>
      </nav>
    </LayoutGroup>
  )
}

export { PageNav, type PageNavProps, type PageNavItem }
