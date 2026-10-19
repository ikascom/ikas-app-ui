"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** Items with an icon line it up with the label; plain text items stay inline so `truncate` keeps working. */
const withIcon =
  "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1.5 [&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3.5"

const SeparatorContext = React.createContext<React.ReactNode>(null)

type BreadcrumbProps = React.ComponentProps<"nav"> & {
  /** Mark between every item of the trail, e.g. `<SlashIcon />`. Change it here and all separators follow. Defaults to a chevron. */
  separator?: React.ReactNode
}

/** The trail's landmark. Pass `aria-label` to name it in another language. */
function Breadcrumb({ separator = null, "aria-label": ariaLabel = "Sayfa yolu", ...props }: BreadcrumbProps) {
  return (
    <SeparatorContext.Provider value={separator}>
      <nav aria-label={ariaLabel} data-slot="breadcrumb" {...props} />
    </SeparatorContext.Provider>
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-[13px] break-words text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

type BreadcrumbLinkProps = React.ComponentProps<"a"> & {
  /** Render the child (e.g. `next/link`) instead of an `<a>`, merging the styles onto it. */
  asChild?: boolean
}

function BreadcrumbLink({ asChild = false, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "rounded-sm transition-colors duration-150 ease-out outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30",
        withIcon,
        className
      )}
      {...props}
    />
  )
}

/** The current page: the last item, not a link. */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-medium text-foreground", withIcon, className)}
      {...props}
    />
  )
}

/** The trail's separator (`Breadcrumb separator`, a chevron by default); children override it for this one. */
function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  const separator = React.useContext(SeparatorContext)
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("text-icon [&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? separator ?? <ChevronRightIcon />}
    </li>
  )
}

/** Stands in for collapsed items; put it in a `DropdownMenuTrigger` to list them. */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-6 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">Diğer sayfalar</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  type BreadcrumbLinkProps,
  type BreadcrumbProps,
}
