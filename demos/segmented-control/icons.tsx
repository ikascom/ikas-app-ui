"use client"

import * as React from "react"
import { LayoutGridIcon, ListIcon, MonitorIcon, SmartphoneIcon } from "lucide-react"

import { SegmentedControl } from "@/components/ikas/segmented-control"

export default function SegmentedControlIcons() {
  const [view, setView] = React.useState("list")
  const [device, setDevice] = React.useState("desktop")

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SegmentedControl
        mode="radio"
        aria-label="Görünüm"
        value={view}
        onValueChange={setView}
        options={[
          { value: "list", icon: <ListIcon />, "aria-label": "Liste" },
          { value: "grid", icon: <LayoutGridIcon />, "aria-label": "Izgara" },
        ]}
      />
      <SegmentedControl
        mode="radio"
        aria-label="Önizleme cihazı"
        value={device}
        onValueChange={setDevice}
        options={[
          { value: "desktop", icon: <MonitorIcon />, label: "Masaüstü" },
          { value: "mobile", icon: <SmartphoneIcon />, label: "Mobil" },
        ]}
      />
    </div>
  )
}
