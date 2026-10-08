"use client"

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AnimatedNumber } from "@/components/ikas/animated-number"

export default function AnimatedNumberCounter() {
  const [count, setCount] = React.useState(1208)

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" aria-label="Azalt" onClick={() => setCount((c) => c - 1)}>
        <MinusIcon />
      </Button>
      <div className="flex min-w-28 flex-col items-center">
        <AnimatedNumber value={count} className="text-3xl font-semibold tracking-[-0.03em]" />
        <span className="text-[13px] text-muted-foreground">sipariş</span>
      </div>
      <Button variant="outline" size="icon" aria-label="Artır" onClick={() => setCount((c) => c + 1)}>
        <PlusIcon />
      </Button>
    </div>
  )
}
