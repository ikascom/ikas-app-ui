"use client"

import * as React from "react"

type DelayedLoadingOptions = {
  /** Wait this long (ms) before showing anything; loads that finish sooner never flash a placeholder. */
  delay?: number
  /** Once shown, keep it at least this long (ms) so it doesn't blink away. */
  minDuration?: number
}

type Phase = "idle" | "waiting" | "shown" | "held"

/**
 * Turns a `loading` flag into one that is safe to show: false for quick loads,
 * and once true, true for at least `minDuration`. Feed the result to `loading`
 * on Button, Skeleton, RecordTable or a chart. On a screen's first load, where
 * there is nothing to keep, pass `loading` straight through instead.
 */
function useDelayedLoading(loading: boolean, { delay = 300, minDuration = 400 }: DelayedLoadingOptions = {}) {
  // waiting: loading, not shown yet. shown: on screen, minimum not reached. held: minimum reached, shown while loading.
  const [phase, setPhase] = React.useState<Phase>("idle")

  if (loading && phase === "idle") setPhase("waiting")
  else if (!loading && (phase === "waiting" || phase === "held")) setPhase("idle")

  React.useEffect(() => {
    if (phase !== "waiting" && phase !== "shown") return
    const timer = window.setTimeout(() => setPhase(phase === "waiting" ? "shown" : "held"), phase === "waiting" ? delay : minDuration)
    return () => window.clearTimeout(timer)
  }, [phase, delay, minDuration])

  return phase === "shown" || phase === "held"
}

export { useDelayedLoading, type DelayedLoadingOptions }
