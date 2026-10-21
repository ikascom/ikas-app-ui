"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SkeletonVariant = "pulse" | "shimmer"

const SkeletonContext = React.createContext<SkeletonVariant | null>(null)

/** The variant placeholders use here: a Skeleton's own `variant`, else the nearest SkeletonProvider, else `pulse`. */
function useSkeletonVariant(variant?: SkeletonVariant): SkeletonVariant {
  const inherited = React.useContext(SkeletonContext)
  return variant ?? inherited ?? "pulse"
}

type SkeletonProviderProps = {
  /** Default for every Skeleton, RecordTable and chart placeholder inside. */
  variant: SkeletonVariant
  children?: React.ReactNode
}

/** Sets the placeholder look once for the whole app, so tables, charts and hand-made skeletons match. */
function SkeletonProvider({ variant, children }: SkeletonProviderProps) {
  return <SkeletonContext.Provider value={variant}>{children}</SkeletonContext.Provider>
}

type SkeletonProps = React.ComponentProps<"div"> & {
  /** `pulse` fades the block in place; `shimmer` sweeps a light across it. Both stop with reduced motion. Defaults to the SkeletonProvider's, else `pulse`. */
  variant?: SkeletonVariant
  /**
   * With children: `true` covers them with the placeholder while they keep their size and can't be reached,
   * `false` shows them. Without children the block always shows.
   */
  loading?: boolean
}

/** The look of the placeholder; on a wrapped child these win over its own background, border and text color. */
const surface = "bg-muted bg-none border-transparent text-transparent shadow-none"
const motion: Record<SkeletonVariant, string> = {
  pulse: "animate-pulse motion-reduce:animate-none",
  shimmer: "animate-skeleton-shimmer",
}

function Skeleton({ variant: variantProp, loading = true, className, children, ...props }: SkeletonProps) {
  const variant = useSkeletonVariant(variantProp)

  if (children == null)
    return (
      <div
        data-slot="skeleton"
        data-variant={variant}
        className={cn("relative overflow-hidden rounded-md", surface, motion[variant], className)}
        {...props}
      />
    )

  if (!loading) return <>{children}</>

  // One element takes the placeholder itself, keeping its own tag, size and shape; text gets an inline span.
  // Plain elements get rounded corners unless they set their own; components (Avatar, Badge…) keep theirs.
  // Spans become inline-block so the shimmer stays inside them; align-top keeps the line from growing.
  const child = React.isValidElement<{ className?: string }>(children) ? children : <span>{children}</span>
  return React.cloneElement(child, {
    ...props,
    "data-skeleton": variant,
    "aria-hidden": true,
    inert: true,
    className: cn(
      typeof child.type === "string" && "rounded-md",
      child.type === "span" && "inline-block align-top",
      variant === "shimmer" && "relative overflow-hidden",
      child.props.className,
      surface,
      "pointer-events-none select-none [&_*]:invisible",
      motion[variant],
      className
    ),
  } as React.HTMLAttributes<HTMLElement>)
}

export { Skeleton, SkeletonProvider, useSkeletonVariant, type SkeletonProps, type SkeletonProviderProps, type SkeletonVariant }
