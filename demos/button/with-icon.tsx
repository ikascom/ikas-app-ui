import { ArrowUpRightIcon, DownloadIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ButtonWithIcon() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <PlusIcon data-icon="inline-start" />
        Kampanya oluştur
      </Button>
      <Button variant="outline">
        <DownloadIcon data-icon="inline-start" />
        CSV olarak dışa aktar
      </Button>
      <Button variant="ghost">
        Mağazada görüntüle
        <ArrowUpRightIcon data-icon="inline-end" />
      </Button>
    </div>
  )
}
