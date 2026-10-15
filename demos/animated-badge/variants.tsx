"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { AnimatedBadge, type AnimatedBadgeStatus } from "@/components/ikas/animated-badge"

const steps: { status: AnimatedBadgeStatus; label: string }[] = [
  { status: "neutral", label: "Taslak" },
  { status: "loading", label: "Eşitleniyor" },
  { status: "success", label: "Eşitlendi" },
  { status: "warning", label: "3 ürün eşleşmedi" },
  { status: "danger", label: "Bağlantı koptu" },
]
const variants = ["soft", "solid", "surface"] as const

export default function AnimatedBadgeVariants() {
  const [step, setStep] = React.useState(0)
  const { status, label } = steps[step]

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-4 gap-y-3">
        {variants.map((variant) => (
          <React.Fragment key={variant}>
            <span className="font-mono text-[11px] text-muted-foreground">{variant}</span>
            <AnimatedBadge variant={variant} status={status}>
              {label}
            </AnimatedBadge>
            <AnimatedBadge variant={variant} status={status} size="sm" media="dot">
              {label}
            </AnimatedBadge>
          </React.Fragment>
        ))}
      </div>
      <Button size="sm" variant="outline" className="self-start" onClick={() => setStep((s) => (s + 1) % steps.length)}>
        Sonraki adım
      </Button>
    </div>
  )
}
