import { Sparkline } from "@/components/ikas/sparkline"
import { StatCard } from "@/components/ikas/stat-card"

const revenue = [42, 45, 44, 48, 47, 52, 55, 53, 58, 61, 60, 66, 68, 72]
const orders = [118, 124, 121, 119, 126, 122, 117, 115, 119, 113, 112, 116, 110, 108]
const refunds = [3.1, 2.9, 3.0, 2.7, 2.6, 2.8, 2.4, 2.3, 2.2, 2.4, 2.1, 1.9, 2.0, 1.8]

export default function SparklineStatCards() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      <StatCard
        label="Ciro"
        value="₺184.320"
        change={12.4}
        changeLabel="son 14 gün"
        footer={<Sparkline data={revenue} highlightColor="var(--chart-1)" aria-label="Ciro son 14 günde artışta" />}
      />
      <StatCard
        label="Siparişler"
        value="1.208"
        change={-3.1}
        changeLabel="son 14 gün"
        footer={<Sparkline data={orders} highlightColor="var(--chart-1)" aria-label="Sipariş sayısı son 14 günde hafif düşüşte" />}
      />
      <StatCard
        label="İade oranı"
        value="%1,8"
        change={-0.6}
        invertChange
        changeLabel="son 14 gün"
        footer={<Sparkline data={refunds} variant="line" highlightColor="var(--chart-1)" aria-label="İade oranı son 14 günde düşüşte" />}
      />
    </div>
  )
}
