import { DonutChart } from "@/components/ikas/donut-chart"

export default function DonutChartPayments() {
  return (
    <DonutChart
      height={180}
      centerLabel="Sipariş"
      data={[
        { key: "card", label: "Kredi kartı", value: 842 },
        { key: "transfer", label: "Havale / EFT", value: 214 },
        { key: "cod", label: "Kapıda ödeme", value: 131 },
        { key: "wallet", label: "Dijital cüzdan", value: 58 },
      ]}
    />
  )
}
