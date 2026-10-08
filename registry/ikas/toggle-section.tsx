"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Collapse } from "@/components/ikas/collapse"

type ToggleSectionProps = Omit<React.ComponentProps<"section">, "title" | "onChange"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** Leading 16px icon in a muted tile. */
  icon?: React.ReactNode
  /** Badge or meta shown after the title, e.g. a status. */
  meta?: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** Settings revealed while the section is on. Leave empty for a plain on/off feature. */
  children?: React.ReactNode
}

/**
 * An opt-in feature: a switch in the header, its settings revealed underneath
 * only while it is on. The most common block in ikas app settings
 * (widgets, events, automations, channels).
 */
function ToggleSection({ title, description, icon, meta, checked, onCheckedChange, disabled, children, className, ...props }: ToggleSectionProps) {
  const id = React.useId()

  return (
    <section
      data-slot="toggle-section"
      data-state={checked ? "on" : "off"}
      className={cn("flex flex-col rounded-xl bg-card shadow-card transition-shadow duration-150", className)}
      {...props}
    >
      <div className="flex items-start gap-3 p-4">
        {icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-icon transition-colors duration-150 [&_svg]:size-4",
              checked && "bg-foreground text-background"
            )}
          >
            {icon}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`${id}-switch`} className="text-sm font-medium">
              {title}
            </label>
            {meta}
          </div>
          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
        </div>
        <Switch
          id={`${id}-switch`}
          className="mt-0.5"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-controls={children ? `${id}-body` : undefined}
          aria-expanded={children ? checked : undefined}
        />
      </div>
      {children && (
        <Collapse open={checked} id={`${id}-body`}>
          <div className="border-t px-4 py-4">{children}</div>
        </Collapse>
      )}
    </section>
  )
}

export { ToggleSection, type ToggleSectionProps }
