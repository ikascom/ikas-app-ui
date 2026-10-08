import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const layoutVariants = cva("grid w-full items-start gap-5", {
  variants: {
    columns: {
      /** Single column stack. */
      one: "grid-cols-1",
      /** Main content plus a narrow aside (2/3 + 1/3). Detail pages. */
      "main-aside": "grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]",
      /** Two equal columns. */
      half: "grid-cols-1 md:grid-cols-2",
      /** Three equal columns. Stat rows, card grids. */
      third: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    },
  },
  defaultVariants: {
    columns: "one",
  },
})

function Layout({
  className,
  columns,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof layoutVariants>) {
  return (
    <div data-slot="layout" className={cn(layoutVariants({ columns }), className)} {...props} />
  )
}

function LayoutColumn({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="layout-column" className={cn("flex min-w-0 flex-col gap-5", className)} {...props} />
  )
}

type AnnotatedSectionProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
}

/**
 * Settings style row: explanation on the left, controls on the right.
 * Stack several of them inside a narrow Page, separated by nothing but space.
 */
function AnnotatedSection({ className, title, description, children, ...props }: AnnotatedSectionProps) {
  return (
    <section
      data-slot="annotated-section"
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-8", className)}
      {...props}
    >
      <div className="flex flex-col gap-1 md:pt-1">
        <h2 className="font-heading text-[15px] font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  )
}

export { Layout, LayoutColumn, AnnotatedSection, layoutVariants }
