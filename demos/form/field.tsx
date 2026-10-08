import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function FormField() {
  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="campaign-name">Kampanya adı</FieldLabel>
        <Input id="campaign-name" defaultValue="Sonbahar indirimi" />
        <FieldDescription>Bu adı yalnızca siz görürsünüz.</FieldDescription>
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="discount-code">İndirim kodu</FieldLabel>
        <Input id="discount-code" defaultValue="SONBAHAR 25" aria-invalid />
        <FieldError>Kod yalnızca harf, rakam ve tire içerebilir.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="note">İç not</FieldLabel>
        <Textarea id="note" placeholder="Yalnızca personel görür" />
      </Field>
    </FieldGroup>
  )
}
