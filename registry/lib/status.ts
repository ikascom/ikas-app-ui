/**
 * Status tint: one set of local variables per status, so a component can color
 * its surface, text, icon and actions from a single class instead of repeating
 * five tokens per status. Banner, Toast, EmptyState and Meter read these.
 *
 *   --s         solid status color            --s-icon   icon: halfway between solid and text,
 *   --s-fg      text on the solid                         so amber stays 3:1 on white and on its fill
 *   --s-subtle  soft fill                     --s-title  title on the soft fill
 *   --s-text    tinted text (subtle-fg)       --s-body   body text on the soft fill
 *   --s-border  hairline on the soft fill     --s-hover  hover fill on the soft fill
 *
 * The class strings are literal so Tailwind picks them up wherever this file lives.
 */
export const statusTint = {
  neutral:
    "[--s:var(--neutral)] [--s-fg:var(--neutral-foreground)] [--s-subtle:var(--muted)] [--s-text:var(--neutral-subtle-foreground)] [--s-border:var(--border)] [--s-icon:var(--icon)] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  info: "[--s:var(--info)] [--s-fg:var(--info-foreground)] [--s-subtle:var(--info-subtle)] [--s-text:var(--info-subtle-foreground)] [--s-border:var(--info-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  success:
    "[--s:var(--success)] [--s-fg:var(--success-foreground)] [--s-subtle:var(--success-subtle)] [--s-text:var(--success-subtle-foreground)] [--s-border:var(--success-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  warning:
    "[--s:var(--warning)] [--s-fg:var(--warning-foreground)] [--s-subtle:var(--warning-subtle)] [--s-text:var(--warning-subtle-foreground)] [--s-border:var(--warning-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
  danger:
    "[--s:var(--danger)] [--s-fg:var(--danger-foreground)] [--s-subtle:var(--danger-subtle)] [--s-text:var(--danger-subtle-foreground)] [--s-border:var(--danger-border)] [--s-icon:color-mix(in_oklab,var(--s)_50%,var(--s-text))] [--s-title:color-mix(in_oklab,var(--s-text),var(--foreground)_30%)] [--s-body:color-mix(in_oklab,var(--s-text),var(--foreground)_12%)] [--s-hover:color-mix(in_oklab,var(--s-subtle),var(--s)_18%)]",
} as const

export type Status = keyof typeof statusTint
