import { Badge } from "@/components/ui/badge"

export default function BadgeStatuses() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Taslak</Badge>
      <Badge status="info">Zamanlandı</Badge>
      <Badge status="success">Aktif</Badge>
      <Badge status="warning">İnceleme bekliyor</Badge>
      <Badge status="danger">Başarısız</Badge>
    </div>
  )
}
