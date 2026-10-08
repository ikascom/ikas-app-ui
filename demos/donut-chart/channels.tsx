"use client"

import { DonutChart } from "@/components/ikas/donut-chart"
import { channels } from "@/demos/_data"

const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", notation: "compact", maximumFractionDigits: 1 }).format

export default function DonutChartChannels() {
  return (
    <DonutChart
      centerLabel="Toplam satış"
      valueFormat={money}
      data={[
        { key: "web", label: channels.web, value: 184320 },
        { key: "marketplaceA", label: channels.marketplaceA, value: 126450 },
        { key: "marketplaceB", label: channels.marketplaceB, value: 74210 },
        { key: "social", label: channels.social, value: 38900 },
        { key: "marketplaceC", label: channels.marketplaceC, value: 21730 },
        { key: "mobile", label: channels.mobile, value: 9840 },
        { key: "wholesale", label: channels.wholesale, value: 6120 },
      ]}
    />
  )
}
