import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AnnotatedSection } from "@/components/ikas/layout"

export default function LayoutAnnotatedSection() {
  return (
    <AnnotatedSection
      title="Mağaza bağlantısı"
      description="Ürünlerinizin yayınlandığı pazaryeri hesabı."
    >
      <Card>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="seller-id">Satıcı ID</FieldLabel>
              <Input id="seller-id" defaultValue="TR-88231" />
            </Field>
            <Field>
              <FieldLabel htmlFor="api-key">API anahtarı</FieldLabel>
              <Input id="api-key" type="password" defaultValue="sk_test_xxxxxxxx" />
              <FieldDescription>Satıcı panelinde Hesap → Entegrasyonlar altında bulabilirsiniz.</FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </AnnotatedSection>
  )
}
