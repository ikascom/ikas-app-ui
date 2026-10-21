"use client"

import * as React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton, SkeletonProvider, type SkeletonVariant } from "@/components/ui/skeleton"
import { SegmentedControl } from "@/components/ikas/segmented-control"

/** shadcn's card example: a title, a description and the media area. */
export default function SkeletonCard() {
  const [variant, setVariant] = React.useState<SkeletonVariant>("shimmer")

  return (
    <div className="flex w-full max-w-xs flex-col gap-4">
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
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full" />
          </CardContent>
        </Card>
      </SkeletonProvider>
    </div>
  )
}
