"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XIcon, OctagonAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const bannerVariants = cva(
  "group/banner relative flex w-full gap-3 rounded-xl p-3.5 text-sm [&>[data-slot=banner-icon]]:mt-px [&>[data-slot=banner-icon]]:size-4.5 [&>[data-slot=banner-icon]]:shrink-0 [&>[data-slot=banner-icon]]:text-(--c-icon)",
  {
    variants: {
      status: {
        info: "[--c-bg:var(--info-subtle)] [--c-border:var(--info-border)] [--c-icon:var(--info)]",
        success: "[--c-bg:var(--success-subtle)] [--c-border:var(--success-border)] [--c-icon:var(--success)]",
        warning: "[--c-bg:var(--warning-subtle)] [--c-border:var(--warning-border)] [--c-icon:var(--warning-subtle-foreground)]",
        danger: "[--c-bg:var(--danger-subtle)] [--c-border:var(--danger-border)] [--c-icon:var(--danger)]",
        neutral: "[--c-bg:var(--muted)] [--c-border:var(--border)] [--c-icon:var(--icon)]",
      },
      variant: {
        /** Tinted. Page-level messages that must be noticed. */
        soft: "bg-(--c-bg) shadow-[inset_0_0_0_1px_var(--c-border)]",
        /** White card with a colored icon. Quieter, for messages inside a section. */
        surface: "bg-card shadow-card",
      },
    },
    defaultVariants: {
      status: "info",
      variant: "soft",
    },
  }
)

const statusIcon = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  danger: OctagonAlertIcon,
  neutral: InfoIcon,
} as const

type BannerProps = Omit<React.ComponentProps<"div">, "title"> &
  VariantProps<typeof bannerVariants> & {
    title?: React.ReactNode
    /** Replace the status icon. Pass `false` to hide it. */
    icon?: React.ReactNode | false
    /** Buttons rendered under the content. Use size="sm". */
    actions?: React.ReactNode
    /** Shows a close button. */
    onDismiss?: () => void
  }

function Banner({
  className,
  status = "info",
  variant = "soft",
  title,
  icon,
  actions,
  onDismiss,
  children,
  ...props
}: BannerProps) {
  const Icon = statusIcon[status ?? "info"]

  return (
    <div
      data-slot="banner"
      data-status={status}
      role={status === "danger" || status === "warning" ? "alert" : "status"}
      className={cn(bannerVariants({ status, variant }), onDismiss && "pr-10", className)}
      {...props}
    >
      {icon !== false && (icon ? <span data-slot="banner-icon">{icon}</span> : <Icon data-slot="banner-icon" aria-hidden />)}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && <p className="font-medium text-foreground">{title}</p>}
        {children && <div className="text-foreground/80 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-3">{children}</div>}
        {actions && <div className="mt-2 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Kapat"
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}

export { Banner, bannerVariants, type BannerProps }
