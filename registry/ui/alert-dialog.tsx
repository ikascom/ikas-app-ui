"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

type AlertDialogContentProps = React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  /** sm stacks a centered title over two equal buttons; default is left aligned. */
  size?: "default" | "sm"
}

/** Modal that asks to confirm or cancel. It closes only through its buttons, never on outside click. */
function AlertDialogContent({ className, size = "default", ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-5 text-sm text-popover-foreground shadow-overlay duration-100 outline-none data-[size=default]:sm:max-w-md data-[size=sm]:max-w-xs data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:duration-300 data-closed:duration-200 ease-(--ease-reveal) data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-cols-1 gap-1.5 has-data-[slot=alert-dialog-media]:grid-cols-[auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-3.5",
        "group-data-[size=sm]/alert-dialog-content:grid-cols-1! group-data-[size=sm]/alert-dialog-content:place-items-center group-data-[size=sm]/alert-dialog-content:text-center",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "-mx-5 -mb-5 mt-1 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 px-5 py-4 sm:flex-row sm:justify-end",
        "group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2",
        className
      )}
      {...props}
    />
  )
}

const tones = {
  danger: "bg-danger-subtle text-danger-subtle-foreground",
  warning: "bg-warning-subtle text-warning-subtle-foreground",
  info: "bg-info-subtle text-info-subtle-foreground",
  success: "bg-success-subtle text-success-subtle-foreground",
  neutral: "bg-muted text-icon",
} as const

type AlertDialogMediaProps = React.ComponentProps<"div"> & {
  /** Status color of the icon tile. */
  tone?: keyof typeof tones
}

/** Icon tile beside the title, tinted by status. */
function AlertDialogMedia({ className, tone = "neutral", ...props }: AlertDialogMediaProps) {
  return (
    <div
      data-slot="alert-dialog-media"
      data-tone={tone}
      className={cn(
        "row-span-2 flex size-10 items-center justify-center rounded-full group-data-[size=sm]/alert-dialog-content:row-span-1 group-data-[size=sm]/alert-dialog-content:mb-1 [&_svg:not([class*='size-'])]:size-5",
        tones[tone],
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("font-heading self-center text-base leading-snug font-medium", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-sm text-pretty text-muted-foreground group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2 group-data-[size=sm]/alert-dialog-content:col-start-1! *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

type AlertDialogButtonProps = Pick<React.ComponentProps<typeof Button>, "variant" | "size" | "color">

/** Confirms and closes. Use color="red" for destructive actions. */
function AlertDialogAction({
  className,
  variant = "solid",
  size = "default",
  color,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> & AlertDialogButtonProps) {
  return (
    <Button variant={variant} size={size} color={color} asChild>
      <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(className)} {...props} />
    </Button>
  )
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  color,
  children = "Vazgeç",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> & AlertDialogButtonProps) {
  return (
    <Button variant={variant} size={size} color={color} asChild>
      <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(className)} {...props}>
        {children}
      </AlertDialogPrimitive.Cancel>
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  type AlertDialogContentProps,
  type AlertDialogMediaProps,
}
