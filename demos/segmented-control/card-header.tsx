"use client"

import * as React from "react"

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SegmentedControl } from "@/components/ikas/segmented-control"

const data = {
  "7": { value: "₺48.210", label: "son 7 gün" },
  "30": { value: "₺184.320", label: "son 30 gün" },
  "90": { value: "₺512.940", label: "son 90 gün" },
} as const

export default function SegmentedControlCardHeader() {
  const [range, setRange] = React.useState<keyof typeof data>("30")

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Ciro</CardTitle>
        <CardAction>
          <SegmentedControl
            size="sm"
            mode="radio"
            aria-label="Zaman aralığı"
            value={range}
            onValueChange={setRange}
            options={[
              { value: "7", label: "7G" },
              { value: "30", label: "30G" },
              { value: "90", label: "90G" },
            ]}
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-[-0.02em] tabular-nums">{data[range].value}</span>
        <span className="text-[13px] text-muted-foreground">{data[range].label}</span>
      </CardContent>
    </Card>
  )
}
