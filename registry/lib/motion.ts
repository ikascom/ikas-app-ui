import type { Transition } from "motion/react"

/**
 * Motion tokens. The single source for every spring and curve in the app:
 * components never hand-write their own. The CSS mirrors (--ease-*) live in
 * the theme, so Tailwind classes and motion/react stay in sync.
 */

/** ζ≈0.94, no overshoot, settles in ~230ms. Pills, morphs, enter/exit, numbers. */
export const SPRING: Transition = { type: "spring", stiffness: 350, damping: 35 }

/** ζ≈0.75, ~3% overshoot. Icons only, so they feel a little alive. */
export const ICON_SPRING: Transition = { type: "spring", stiffness: 350, damping: 28 }

/** ζ≈1, no overshoot, ~30% quicker than SPRING. Rows and panels closing: exits run faster than entries. */
export const SPRING_EXIT: Transition = { type: "spring", stiffness: 520, damping: 46 }

/** The reduced-motion branch. */
export const INSTANT: Transition = { duration: 0 }

/** Seconds between items that animate in sequence (connectors, segments). Keep runs under ~0.3s in total. */
export const STAGGER = 0.06

/** Things entering or leaving the screen. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const
/** Things that move or change shape on screen. */
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
/** Overlays that grow out of their trigger (dialogs, popovers). */
export const EASE_REVEAL = [0.33, 1, 0.68, 1] as const
/** Sheets, drawers, sidebars. */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

export const springOrInstant = (reduce: boolean | null): Transition => (reduce ? INSTANT : SPRING)

/** Fade timings for content that appears inside an expanding container. */
export const FADE_IN: Transition = { duration: 0.15, ease: EASE_OUT }
export const FADE_OUT: Transition = { duration: 0.1, ease: EASE_OUT }

/**
 * Dynamic-island morphs only (IslandToaster), after the animations.dev recipe: springs with
 * bounce, set per transition, more bounce for a smaller target. Nothing else in the app bounces;
 * exits stay on SPRING_EXIT.
 */
export const ISLAND_SPRING = {
  /** From beyond the edge into a small pill. */
  enter: { type: "spring", duration: 0.5, bounce: 0.35 },
  /** Pill to the open card: a large target, the least bounce. */
  open: { type: "spring", duration: 0.5, bounce: 0.2 },
  /** Open card back to the pill: a small target, more bounce. */
  fold: { type: "spring", duration: 0.45, bounce: 0.3 },
  /** Layers shifting in the stack, the list opening and closing. */
  stack: { type: "spring", duration: 0.4, bounce: 0.15 },
  /** Back into place after a swipe that did not dismiss: the drag applied force. */
  release: { type: "spring", duration: 0.35, bounce: 0.25 },
} satisfies Record<string, Transition>
