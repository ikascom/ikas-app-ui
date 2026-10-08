import { Badge } from "@/components/ui/badge"

export default function BadgeTones() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Taslak</Badge>
      <Badge tone="info">Zamanlandı</Badge>
      <Badge tone="success">Aktif</Badge>
      <Badge tone="warning">İnceleme bekliyor</Badge>
      <Badge tone="critical">Başarısız</Badge>
    </div>
  )
}
