"use client"

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AnimatedNumber } from "@/components/ikas/animated-number"

type NumberStepperProps = {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  /** Amount added or removed per click. */
  step?: number
  /** sm (28px) for table rows, default (36px) for forms. */
  size?: "sm" | "default"
  /** Accessible name, e.g. "Stok adedi". */
  label: string
  className?: string
}

/**
 * Number input with −/+ buttons. Click the value to type it directly; Enter
 * or blur commits, Esc cancels. Use instead of <Input type="number">.
 */
function NumberStepper({ value, onValueChange, min = 0, max = 100000, step = 1, size = "default", label, className }: NumberStepperProps) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  function commit() {
    const parsed = Number(draft.replace(/\./g, "").replace(",", "."))
    if (draft.trim() !== "" && Number.isFinite(parsed)) onValueChange(clamp(Math.round(parsed / step) * step))
    setEditing(false)
  }

  const sm = size === "sm"

  return (
    <div
      data-slot="number-stepper"
      role="group"
      aria-label={label}
      className={cn(
        // w-fit! beats Field's *:w-full so the stepper keeps its size inside a vertical Field.
        "inline-flex w-fit! items-center rounded-lg border border-input bg-card shadow-inset transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20",
        sm ? "h-7" : "h-9",
        className
      )}
    >
      <Button
        variant="ghost"
        size={sm ? "icon-xs" : "icon-sm"}
        className={cn("rounded-r-none", sm ? "h-full" : "h-full w-8")}
        aria-label="Azalt"
        disabled={value <= min}
        onClick={() => onValueChange(clamp(value - step))}
      >
        <MinusIcon />
      </Button>
      {editing ? (
        <input
          autoFocus
          inputMode="numeric"
          aria-label={label}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit()
            if (event.key === "Escape") setEditing(false)
          }}
          className={cn("h-full w-14 bg-transparent text-center tabular-nums outline-none", sm ? "text-[13px]" : "text-sm")}
        />
      ) : (
        <button
          type="button"
          aria-label={`${label}: ${value}. Düzenlemek için tıklayın`}
          onClick={() => {
            setDraft(String(value))
            setEditing(true)
          }}
          className={cn(
            "flex h-full w-14 cursor-text items-center justify-center font-medium outline-none hover:bg-muted/60",
            sm ? "text-[13px]" : "text-sm"
          )}
        >
          <AnimatedNumber value={value} />
        </button>
      )}
      <Button
        variant="ghost"
        size={sm ? "icon-xs" : "icon-sm"}
        className={cn("rounded-l-none", sm ? "h-full" : "h-full w-8")}
        aria-label="Artır"
        disabled={value >= max}
        onClick={() => onValueChange(clamp(value + step))}
      >
        <PlusIcon />
      </Button>
    </div>
  )
}

export { NumberStepper, type NumberStepperProps }
