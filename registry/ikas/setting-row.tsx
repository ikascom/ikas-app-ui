import * as React from "react"

import { cn } from "@/lib/utils"

type SettingRowProps = Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /** id of the control so the title acts as its label. */
  htmlFor?: string
  /** The control: Switch, Select, Button... */
  control: React.ReactNode
}

/**
 * One setting with its control aligned right.
 * Stack inside a Card with `divide-y` for a settings list.
 */
function SettingRow({ className, title, description, htmlFor, control, ...props }: SettingRowProps) {
  const Title = htmlFor ? "label" : "p"

  return (
    <div
      data-slot="setting-row"
      className={cn("flex items-start justify-between gap-6 py-3.5 first:pt-0 last:pb-0", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <Title htmlFor={htmlFor} className="text-sm font-medium text-foreground">
          {title}
        </Title>
        {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
      </div>
      <div className="flex shrink-0 items-center pt-0.5">{control}</div>
    </div>
  )
}

export { SettingRow, type SettingRowProps }
