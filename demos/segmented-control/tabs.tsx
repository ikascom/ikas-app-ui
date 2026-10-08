"use client"

import * as React from "react"

import { SegmentedControl } from "@/components/ikas/segmented-control"

export default function SegmentedControlTabs() {
  const [tab, setTab] = React.useState("all")

  return (
    <SegmentedControl
      aria-label="Sipariş filtresi"
      value={tab}
      onValueChange={setTab}
      options={[
        { value: "all", label: "Tümü" },
        { value: "pending", label: "Bekleyen", badge: 3 },
        { value: "done", label: "Tamamlanan" },
      ]}
    />
  )
}
