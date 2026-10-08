"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, XIcon, OctagonAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * Each status points the local --b-* variables at one status color; everything
 * else (title, body, links, icon, buttons in `actions`) reads only those:
 *   --b         solid status color      --b-text    tinted text (subtle-foreground)
 *   --b-fg      text on the solid        --b-border  hairline on the soft fill
 *   --b-subtle  soft fill
 */
const bannerVariants = cva(
  [
    "group/banner relative flex w-full gap-3 rounded-xl p-3.5 text-sm",
    // Icon: halfway between the solid color and the tinted text, so amber stays 3:1 on its fill.
    "[--b-icon:color-mix(in_oklab,var(--b)_50%,var(--b-text))] [&>[data-slot=banner-icon]]:mt-px [&>[data-slot=banner-icon]]:size-4.5 [&>[data-slot=banner-icon]]:shrink-0 [&>[data-slot=banner-icon]]:text-(--b-icon)",
    "[&_a]:font-medium [&_a]:text-(--b-link) [&_a]:underline [&_a]:decoration-(--b-icon)/50 [&_a]:underline-offset-3 [&_a]:transition-colors [&_a:hover]:decoration-current",
  ],
  {
    variants: {
      status: {
        info: "[--b:var(--info)] [--b-fg:var(--info-foreground)] [--b-subtle:var(--info-subtle)] [--b-text:var(--info-subtle-foreground)] [--b-border:var(--info-border)]",
        success:
          "[--b:var(--success)] [--b-fg:var(--success-foreground)] [--b-subtle:var(--success-subtle)] [--b-text:var(--success-subtle-foreground)] [--b-border:var(--success-border)]",
        warning:
          "[--b:var(--warning)] [--b-fg:var(--warning-foreground)] [--b-subtle:var(--warning-subtle)] [--b-text:var(--warning-subtle-foreground)] [--b-border:var(--warning-border)]",
        danger:
          "[--b:var(--danger)] [--b-fg:var(--danger-foreground)] [--b-subtle:var(--danger-subtle)] [--b-text:var(--danger-subtle-foreground)] [--b-border:var(--danger-border)]",
        neutral:
          "[--b:var(--neutral)] [--b-fg:var(--neutral-foreground)] [--b-subtle:var(--muted)] [--b-text:var(--neutral-subtle-foreground)] [--b-border:var(--border)] [--b-icon:var(--icon)]",
      },
      variant: {
        /**
         * Tinted fill, tinted text. Page-level messages that must be noticed.
         * Default-colored buttons in `actions` (and the close button) take the
         * status too: solid → status fill, soft/ghost → deeper tint, outline →
         * a translucent raised surface with a status hairline.
         */
        soft: [
          "bg-(--b-subtle) shadow-[inset_0_0_0_1px_var(--b-border)]",
          "[--b-title:color-mix(in_oklab,var(--b-text),var(--foreground)_30%)] [--b-body:color-mix(in_oklab,var(--b-text),var(--foreground)_12%)] [--b-link:var(--b-title)] [--b-hover:color-mix(in_oklab,var(--b-subtle),var(--b)_18%)]",
          "[&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c:var(--b)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-fg:var(--b-fg)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-subtle:var(--b-hover)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-subtle-fg:var(--b-title)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]]:[--c-text:var(--b-title)]",
          "[&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral][data-variant=outline]]:bg-tint-surface [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral][data-variant=outline]]:shadow-[inset_0_0_0_1px_var(--b-border),0_1px_2px_0_var(--shade-1)] [&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral][data-variant=outline]:hover]:bg-tint-surface-hover",
          // Focus ring in the status color: the default blue ring all but disappears on amber and red fills.
          "[&_[data-slot=banner-actions]_[data-slot=button][data-color=neutral]:focus-visible]:ring-(--b-icon)/50 [&>[data-banner-dismiss]:focus-visible]:ring-(--b-icon)/50",
        ],
        /** White card, colored icon, neutral text. Quieter, for messages inside a section. */
        surface:
          "bg-card shadow-card [--b-title:var(--foreground)] [--b-body:color-mix(in_oklab,var(--foreground)_80%,transparent)] [--b-link:var(--b-text)] [--b-hover:var(--muted)]",
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
    /**
     * Buttons rendered under the content. Use size="sm" and leave `color` unset:
     * in the soft variant they pick up the banner's status.
     */
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
      data-variant={variant}
      role={status === "danger" || status === "warning" ? "alert" : "status"}
      className={cn(bannerVariants({ status, variant }), onDismiss && "pr-10", className)}
      {...props}
    >
      {icon !== false && (icon ? <span data-slot="banner-icon">{icon}</span> : <Icon data-slot="banner-icon" aria-hidden />)}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title && (
          <p data-slot="banner-title" className="font-medium text-(--b-title)">
            {title}
          </p>
        )}
        {children && (
          <div data-slot="banner-description" className="text-(--b-body)">
            {children}
          </div>
        )}
        {actions && (
          <div data-slot="banner-actions" className="mt-2 flex flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Kapat"
          data-banner-dismiss=""
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 [--c-subtle:var(--b-hover)] [--c-text:color-mix(in_oklab,var(--b-title)_60%,transparent)] hover:text-(--b-title)"
        >
          <XIcon />
        </Button>
      )}
    </div>
  )
}

export { Banner, bannerVariants, type BannerProps }
