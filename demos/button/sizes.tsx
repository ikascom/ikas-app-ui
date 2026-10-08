import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Çok küçük</Button>
      <Button size="sm">Küçük</Button>
      <Button>Varsayılan</Button>
      <Button size="lg">Büyük</Button>
      <Button size="icon-xs" variant="outline" aria-label="Ekle">
        <PlusIcon />
      </Button>
      <Button size="icon-sm" variant="outline" aria-label="Ekle">
        <PlusIcon />
      </Button>
      <Button size="icon" variant="outline" aria-label="Ekle">
        <PlusIcon />
      </Button>
      <Button size="icon-lg" variant="outline" aria-label="Ekle">
        <PlusIcon />
      </Button>
    </div>
  )
}
