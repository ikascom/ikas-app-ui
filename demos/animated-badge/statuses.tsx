"use client"

import * as React from "react"

import { AnimatedBadge, type AnimatedBadgeStatus } from "@/components/ikas/animated-badge"
import { SegmentedControl } from "@/components/ikas/segmented-control"

const labels: Record<AnimatedBadgeStatus, string> = {
  neutral: "Taslak",
  info: "Zamanlandı",
  success: "Aktif",
  warning: "İnceleme bekliyor",
  danger: "Başarısız",
  loading: "Eşitleniyor",
}

export default function AnimatedBadgeStatuses() {
  const [status, setStatus] = React.useState<AnimatedBadgeStatus>("neutral")

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6">
      <div className="flex h-10 items-center text-[26px]">
        <AnimatedBadge status={status} className="origin-left scale-[2]">
          {labels[status]}
        </AnimatedBadge>
      </div>
      <SegmentedControl
        size="sm"
        mode="radio"
        aria-label="Durum"
        value={status}
        onValueChange={setStatus}
        options={(Object.keys(labels) as AnimatedBadgeStatus[]).map((value) => ({ value, label: value }))}
      />
    </div>
  )
}
