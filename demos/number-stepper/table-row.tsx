"use client"

import * as React from "react"

import { NumberStepper } from "@/components/ikas/number-stepper"

const items = [
  { id: "1", name: "Keten gömlek", variant: "Ekru / M" },
  { id: "2", name: "Geniş paça pantolon", variant: "Siyah / 38" },
  { id: "3", name: "Kanvas çanta", variant: "Doğal" },
]

export default function NumberStepperTableRow() {
  const [qty, setQty] = React.useState<Record<string, number>>({ "1": 2, "2": 1, "3": 5 })

  return (
    <div className="w-full max-w-md divide-y rounded-xl bg-card shadow-card">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{item.name}</span>
            <span className="text-[13px] text-muted-foreground">{item.variant}</span>
          </div>
          <NumberStepper
            size="sm"
            label={`${item.name} sipariş adedi`}
            value={qty[item.id]}
            min={1}
            max={50}
            onValueChange={(value) => setQty((q) => ({ ...q, [item.id]: value }))}
          />
        </div>
      ))}
    </div>
  )
}
