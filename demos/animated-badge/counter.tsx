"use client"

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AnimatedBadge } from "@/components/ikas/animated-badge"

export default function AnimatedBadgeCounter() {
  const [count, setCount] = React.useState(3)

  return (
    <div className="flex items-center gap-3">
      <Button size="icon-sm" variant="outline" aria-label="Azalt" onClick={() => setCount((n) => Math.max(0, n - 1))}>
        <MinusIcon />
      </Button>
      {/* Two parts: only the number rolls, the unit stays put. */}
      <AnimatedBadge status={count === 0 ? "success" : "warning"} media="dot">
        {[count, " bekleyen"]}
      </AnimatedBadge>
      <Button size="icon-sm" variant="outline" aria-label="Artır" onClick={() => setCount((n) => Math.min(99, n + 1))}>
        <PlusIcon />
      </Button>
    </div>
  )
}
