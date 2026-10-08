import { StatCard } from "@/components/ikas/stat-card"
import { Layout } from "@/components/ikas/layout"

export default function StatCardRow() {
  return (
    <Layout columns="third">
      <StatCard label="Gelir" value="₺184.320" change={12.4} changeLabel="önceki 30 güne göre" />
      <StatCard label="Siparişler" value="1.208" change={-3.1} changeLabel="önceki 30 güne göre" />
      <StatCard label="İade oranı" value="1,8%" change={-0.6} invertChange changeLabel="önceki 30 güne göre" />
    </Layout>
  )
}
