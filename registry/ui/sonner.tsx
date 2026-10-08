"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { InfoIcon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { AnimatedCheckIcon } from "@/components/ikas/animated-check"

/**
 * Sonner, unstyled and dressed in ikas tokens: a raised card surface, the
 * tone carried by the icon only, our Button for actions. Use it for
 * confirmations that need no follow-up ("Kaydedildi"); anything the merchant
 * must act on belongs in a Banner.
 */
const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      gap={8}
      visibleToasts={4}
      className="toaster group"
      icons={{
        success: (
          <span className="flex size-4.5 items-center justify-center rounded-full bg-success text-success-foreground">
            <AnimatedCheckIcon className="size-3" strokeWidth={3} />
          </span>
        ),
        info: <InfoIcon className="size-4.5 text-info" />,
        warning: <TriangleAlertIcon className="size-4.5 text-warning-subtle-foreground" />,
        error: <OctagonXIcon className="size-4.5 text-critical" />,
        loading: <Spinner className="size-4 text-icon" />,
      }}
      toastOptions={{
        ...toastOptions,
        unstyled: true,
        classNames: {
          toast: cn(
            "group/toast flex w-full items-start gap-3 rounded-xl bg-popover py-3 pr-3 pl-3.5 text-sm text-popover-foreground shadow-overlay sm:w-[360px]",
            // Plain toast(): no icon, keep the text aligned with the surface edge.
            "has-[[data-icon]:empty]:pl-4"
          ),
          icon: "relative mt-px flex size-4.5 shrink-0 items-center justify-center [&:empty]:hidden",
          content: "flex min-w-0 flex-1 flex-col gap-0.5 py-px",
          title: "font-medium leading-5",
          description: "text-[13px] leading-5 text-muted-foreground",
          actionButton: cn(buttonVariants({ variant: "outline", size: "xs" }), "ml-1 shrink-0 self-center"),
          cancelButton: cn(buttonVariants({ variant: "ghost", size: "xs" }), "shrink-0 self-center text-muted-foreground"),
          closeButton: "text-icon hover:text-foreground",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
