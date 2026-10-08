import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Page, PageHeader } from "@/components/ikas/page"

export default function PageSimple() {
  return (
    <Page width="full" className="p-0 sm:p-0">
      <PageHeader
        title="Kampanyalar"
        description="Ödeme adımında otomatik uygulanan indirimler."
        actions={
          <Button>
            <PlusIcon data-icon="inline-start" />
            Kampanya oluştur
          </Button>
        }
      />
    </Page>
  )
}
