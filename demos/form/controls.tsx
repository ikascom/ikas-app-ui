import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function FormControls() {
  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="sync-interval">Eşitleme sıklığı</FieldLabel>
        <Select defaultValue="15">
          <SelectTrigger id="sync-interval" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="5">5 dakikada bir</SelectItem>
            <SelectItem value="15">15 dakikada bir</SelectItem>
            <SelectItem value="60">Saatte bir</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="notify" defaultChecked />
        <FieldContent>
          <FieldLabel htmlFor="notify">Eşitleme başarısız olursa e-posta gönder</FieldLabel>
          <FieldDescription>Mağaza sahibinin adresine gönderilir.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor="auto-publish">Yeni ürünleri otomatik yayınla</FieldLabel>
        </FieldContent>
        <Switch id="auto-publish" />
      </Field>
    </FieldGroup>
  )
}
