import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SettingRow } from "@/components/ikas/setting-row"
import { SettingsGroup } from "@/components/ikas/layout"
import { marketplace } from "@/demos/_data"

export default function LayoutSettingsGroup() {
  return (
    <div className="flex w-full flex-col gap-8">
      <SettingsGroup index="01" label="Mağaza bağlantısı" hint="Ürünlerinizin yayınlandığı pazaryeri hesabı.">
        <Card>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="seller-id">Satıcı ID</FieldLabel>
                <Input id="seller-id" defaultValue={marketplace.sellerId} />
              </Field>
              <Field>
                <FieldLabel htmlFor="api-key">API anahtarı</FieldLabel>
                <Input id="api-key" type="password" defaultValue={marketplace.apiKey} />
                <FieldDescription>Satıcı panelinde Hesap → Entegrasyonlar altında bulabilirsiniz.</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </SettingsGroup>
      <SettingsGroup index="02" label="Stok" hint="Pazaryerine stok değişikliklerinin ne zaman gideceği.">
        <Card>
          <CardContent>
            <SettingRow
              htmlFor="sync-stock"
              title="Stok değişikliklerini anında gönder"
              description="Kapalıysa stok 15 dakikada bir toplu gönderilir."
              control={<Switch id="sync-stock" defaultChecked />}
            />
          </CardContent>
        </Card>
      </SettingsGroup>
    </div>
  )
}
