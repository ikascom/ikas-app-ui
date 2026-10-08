import { SearchXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ikas/empty-state"

export default function EmptyStateSection() {
  return (
    <Card className="w-full max-w-lg py-0">
      <EmptyState
        media={<SearchXIcon />}
        title="Bu filtrelere uyan sipariş yok"
        description="Farklı bir tarih aralığı deneyin ya da ödeme filtresini temizleyin."
        actions={<Button variant="outline">Filtreleri temizle</Button>}
      />
    </Card>
  )
}
