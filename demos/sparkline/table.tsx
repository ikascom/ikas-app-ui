import { Sparkline } from "@/components/ikas/sparkline"

const products = [
  { name: "Basic oversize tişört", sold: 412, trend: [12, 14, 13, 18, 22, 21, 26, 30, 29, 34] },
  { name: "Keten gömlek", sold: 268, trend: [20, 22, 19, 21, 23, 22, 24, 23, 25, 26] },
  { name: "Kanvas çanta", sold: 151, trend: [30, 27, 26, 22, 21, 18, 17, 15, 14, 12] },
  { name: "Yün atkı", sold: 94, trend: [4, 5, 5, 7, 9, 12, 14, 17, 21, 24] },
]

export default function SparklineTable() {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl bg-card shadow-card">
      <div className="grid grid-cols-[1fr_auto_96px] gap-4 border-b px-4 py-2.5 text-[13px] text-muted-foreground">
        <span>Ürün</span>
        <span className="text-right">Satış</span>
        <span>Son 10 gün</span>
      </div>
      {products.map((p) => (
        <div key={p.name} className="grid grid-cols-[1fr_auto_96px] items-center gap-4 border-b px-4 py-3 text-sm last:border-0">
          <span className="truncate font-medium">{p.name}</span>
          <span className="text-right tabular-nums">{p.sold}</span>
          <Sparkline data={p.trend} variant="line" height={24} />
        </div>
      ))}
    </div>
  )
}
