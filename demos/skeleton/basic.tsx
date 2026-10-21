"use client"

import * as React from "react"

import { Skeleton, SkeletonProvider, type SkeletonVariant } from "@/components/ui/skeleton"
import { SegmentedControl } from "@/components/ikas/segmented-control"

/** shadcn's example: an avatar and two lines of text. */
export default function SkeletonBasic() {
  const [variant, setVariant] = React.useState<SkeletonVariant>("shimmer")

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        aria-label="İskelet görünümü"
        mode="radio"
        size="sm"
        className="self-start"
        value={variant}
        onValueChange={setVariant}
        options={[
          { value: "pulse", label: "Nabız" },
          { value: "shimmer", label: "Parıltı" },
        ]}
      />
      <SkeletonProvider variant={variant}>
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </SkeletonProvider>
    </div>
  )
}
