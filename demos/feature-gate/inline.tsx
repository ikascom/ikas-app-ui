"use client"

import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { FeatureGate } from "@/components/ikas/feature-gate"
import { SettingRow } from "@/components/ikas/setting-row"

export default function FeatureGateInline() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Satış ayarları</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        <SettingRow
          htmlFor="multi-language"
          title="Çoklu dil"
          description="Mağazayı 3 dile kadar çevir."
          control={<Switch id="multi-language" defaultChecked />}
        />
        <SettingRow
          htmlFor="subscriptions"
          title="Abonelikli ürünler"
          description="Tekrarlayan ödemeleri otomatik al."
          control={
            <FeatureGate locked variant="inline" title="Abonelikli ürünler" onUpgrade={() => toast("Planlar açılıyor")}>
              <Switch id="subscriptions" />
            </FeatureGate>
          }
        />
        <SettingRow htmlFor="two-factor" title="İki adımlı doğrulama" description="Personel girişlerinde kod iste." control={<Switch id="two-factor" />} />
      </CardContent>
    </Card>
  )
}
