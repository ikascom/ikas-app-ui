"use client"

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AnimatedNumber } from "@/components/ikas/animated-number"

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format
const unitPrice = 649.9

export default function AnimatedNumberCartTotal() {
  const [qty, setQty] = React.useState(2)

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-xl bg-card p-5 shadow-card">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Keten gömlek × {qty}</span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon-xs" aria-label="Bir adet çıkar" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
            <MinusIcon />
          </Button>
          <Button variant="outline" size="icon-xs" aria-label="Bir adet ekle" onClick={() => setQty((q) => q + 1)}>
            <PlusIcon />
          </Button>
        </div>
      </div>
      <div className="flex items-baseline justify-between border-t pt-4">
        <span className="text-sm font-medium">Sepet toplamı</span>
        <AnimatedNumber value={qty * unitPrice} format={money} className="text-xl font-semibold tracking-[-0.02em]" />
      </div>
    </div>
  )
}
