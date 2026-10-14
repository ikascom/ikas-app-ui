"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { MoonIcon, SunIcon } from "lucide-react"

import { FADE_IN, FADE_OUT, ICON_SPRING, INSTANT } from "@/lib/motion"
import { Button, type ButtonProps } from "@/components/ui/button"

type Theme = "light" | "dark"
type ThemeTransition = "reveal" | "eclipse" | "split" | "rise" | "none"

type ThemeSwitchProps = Omit<ButtonProps, "children" | "onClick" | "asChild" | "loading"> & {
  /** Current appearance. Drives the icon and aria-pressed. */
  theme: Theme
  /** Called with the next appearance; apply it here (a class on <html>, next-themes setTheme…). Runs inside the page transition. */
  onThemeChange: (theme: Theme) => void
  /** How the new appearance enters the page: reveal grows a circle from the switch, eclipse slides a disc in from the side, split opens from a vertical seam, rise swells up from the bottom on a curve. */
  transition?: ThemeTransition
  /** Square icon button without the text. */
  iconOnly?: boolean
  /** Visible text next to the icon. */
  label?: React.ReactNode
}

/** Rotation and scale ride the icon spring; opacity fades on the shared tween. */
const enter = { ...ICON_SPRING, opacity: FADE_IN }

/** How long after mount a theme change still counts as the stored preference arriving, not a toggle. */
const SETTLE_MS = 300

/** False right after mount, so a page that loads dark swaps its icon in place instead of spinning it. */
function useSettled() {
  const [settled, setSettled] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => setSettled(true), SETTLE_MS)
    return () => clearTimeout(timer)
  }, [])
  return settled
}

/** Light and dark toggle. Sun and moon trade places on one rotation; the page follows with a view transition. */
function ThemeSwitch({
  theme,
  onThemeChange,
  transition = "reveal",
  iconOnly = false,
  label = "Temayı değiştir",
  variant = "outline",
  size,
  className,
  ...props
}: ThemeSwitchProps) {
  const reduce = useReducedMotion() ?? false
  const settled = useSettled()
  const next: Theme = theme === "light" ? "dark" : "light"
  const animate = settled && !reduce

  function toggle(trigger: HTMLElement) {
    // Read the media query on click too: the hook keeps its first value when the setting changes later.
    const still = reduce || matchMedia("(prefers-reduced-motion: reduce)").matches
    if (transition === "none" || still || !document.startViewTransition) {
      onThemeChange(next)
      return
    }
    const root = document.documentElement
    const { left, top, width, height } = trigger.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    root.style.setProperty("--theme-x", `${x}px`)
    root.style.setProperty("--theme-y", `${y}px`)
    root.style.setProperty("--theme-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`)
    root.dataset.themeTransition = transition
    const run = document.startViewTransition(() => flushSync(() => onThemeChange(next)))
    run.finished.finally(() => {
      delete root.dataset.themeTransition
    })
  }

  return (
    <Button
      type="button"
      data-slot="theme-switch"
      data-theme={theme}
      data-transition={transition}
      aria-label={iconOnly ? (theme === "light" ? "Koyu temaya geç" : "Açık temaya geç") : undefined}
      aria-pressed={theme === "dark"}
      variant={variant}
      size={size ?? (iconOnly ? "icon-sm" : "sm")}
      className={className}
      onClick={(event) => toggle(event.currentTarget)}
      {...props}
    >
      <span className="relative grid size-4 place-items-center">
        {/* The leaving icon turns a quarter clockwise and the arriving one follows from a quarter behind, so every swap spins one way. */}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={theme}
            aria-hidden="true"
            className="absolute grid place-items-center"
            initial={animate ? { opacity: 0, scale: 0.5, rotate: -90 } : false}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={animate ? { opacity: 0, scale: 0.5, rotate: 90, transition: FADE_OUT } : { opacity: 0, transition: INSTANT }}
            transition={animate ? enter : INSTANT}
          >
            {theme === "light" ? <SunIcon data-anim="spin" /> : <MoonIcon data-anim="wiggle" />}
          </motion.span>
        </AnimatePresence>
      </span>
      {!iconOnly && label}
    </Button>
  )
}

export { ThemeSwitch, type ThemeSwitchProps, type Theme, type ThemeTransition }
