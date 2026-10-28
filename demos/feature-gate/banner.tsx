"use client"

import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { FeatureGate } from "@/components/ikas/feature-gate"

export default function FeatureGateBanner() {
  return (
    <Card className="w-full max-w-xl overflow-hidden py-0">
      <FeatureGate
        locked
        variant="banner"
        title="Gelişmiş SEO ayarları Pro planda"
        description="Şimdilik yalnızca görüntüleyebilirsiniz."
        onUpgrade={() => toast("Planlar açılıyor")}
      >
        <FieldGroup className="p-4">
          <Field>
            <FieldLabel htmlFor="seo-canonical">Kanonik URL</FieldLabel>
            <Input id="seo-canonical" defaultValue="https://magaza.example/urunler" />
          </Field>
          <Field>
            <FieldLabel htmlFor="seo-robots">Robots yönergesi</FieldLabel>
            <Input id="seo-robots" defaultValue="index, follow" />
          </Field>
        </FieldGroup>
      </FeatureGate>
    </Card>
  )
}
