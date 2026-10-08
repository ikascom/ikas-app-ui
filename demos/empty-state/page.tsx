import { MegaphoneIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ikas/empty-state"

export default function EmptyStatePage() {
  return (
    <EmptyState
      size="page"
      media={<MegaphoneIcon />}
      title="İlk kampanyanızı oluşturun"
      description="Kampanyalar, kod gerektirmeden ödeme adımında indirimi otomatik uygular."
      actions={
        <>
          <Button>
            <PlusIcon data-icon="inline-start" />
            Kampanya oluştur
          </Button>
          <Button variant="outline">CSV’den içe aktar</Button>
        </>
      }
      footer={
        <>
          Yardım mı lazım? <a href="#">Kampanya rehberini okuyun</a>
        </>
      }
    />
  )
}
