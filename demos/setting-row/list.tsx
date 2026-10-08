import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { SettingRow } from "@/components/ikas/setting-row"

export default function SettingRowList() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Bildirimler</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        <SettingRow
          htmlFor="notify-orders"
          title="Yeni sipariş bildirimleri"
          description="Her yeni siparişte mağaza sahibine e-posta gönder."
          control={<Switch id="notify-orders" defaultChecked />}
        />
        <SettingRow
          htmlFor="notify-stock"
          title="Düşük stok uyarıları"
          description="Bir varyantın stoğu 5’in altına düştüğünde."
          control={<Switch id="notify-stock" />}
        />
        <SettingRow
          htmlFor="digest"
          title="Günlük özet"
          control={
            <Select defaultValue="09">
              <SelectTrigger id="digest" size="sm" className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="off">Kapalı</SelectItem>
                <SelectItem value="09">09:00</SelectItem>
                <SelectItem value="18">18:00</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </CardContent>
    </Card>
  )
}
