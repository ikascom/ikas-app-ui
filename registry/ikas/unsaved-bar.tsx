"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type UnsavedBarProps = Omit<React.ComponentProps<"div">, "onSubmit"> & {
  /** Show the bar. Usually `form.formState.isDirty`. */
  open: boolean
  message?: React.ReactNode
  onSave: () => void
  onDiscard: () => void
  saving?: boolean
  saveLabel?: string
  discardLabel?: string
  /**
   * "fixed" pins to the viewport bottom (full app pages).
   * "sticky" sticks inside the scroll container (embedded iframes, panels).
   */
  position?: "fixed" | "sticky"
}

/**
 * Appears when a form has unsaved changes. Never put Save buttons at the
 * bottom of long settings forms; use this instead.
 */
function UnsavedBar({
  className,
  open,
  message = "Kaydedilmemiş değişiklikler",
  onSave,
  onDiscard,
  saving = false,
  saveLabel = "Kaydet",
  discardLabel = "Vazgeç",
  position = "fixed",
  ...props
}: UnsavedBarProps) {
  if (!open) return null

  return (
    <div
      data-slot="unsaved-bar"
      role="region"
      aria-label="Kaydedilmemiş değişiklikler"
      className={cn(
        "z-40 flex justify-center px-4 pb-4",
        position === "fixed" ? "fixed inset-x-0 bottom-0" : "sticky bottom-0",
        "animate-in duration-200 fade-in-0 slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      <div className="flex w-full max-w-xl items-center justify-between gap-4 rounded-xl bg-foreground py-2 pr-2 pl-4 text-background shadow-overlay">
        <p className="truncate text-sm font-medium">{message}</p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDiscard}
            disabled={saving}
            className="text-background hover:bg-background/10 hover:text-background active:bg-background/15"
          >
            {discardLabel}
          </Button>
          <Button size="sm" onClick={onSave} loading={saving}>
            {saveLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export { UnsavedBar, type UnsavedBarProps }
