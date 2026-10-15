"use client"

import { DownloadIcon, ListFilterIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FeatureGate } from "@/components/ikas/feature-gate"

export default function FeatureGateAction() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline">
        <ListFilterIcon data-icon="inline-start" />
        Filtrele
      </Button>
      <FeatureGate
        locked
        variant="action"
        title="Toplu dışa aktarma"
        description="Siparişleri CSV ve Excel olarak indirmek Pro planda."
        onUpgrade={() => toast("Planlar açılıyor")}
        onCompare={() => toast("Plan karşılaştırması açılıyor")}
      >
        <Button variant="outline">
          <DownloadIcon data-icon="inline-start" />
          Dışa aktar
        </Button>
      </FeatureGate>
    </div>
  )
}
