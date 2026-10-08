import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DescriptionList } from "@/components/ikas/description-list"
import { customer } from "@/demos/_data"

export default function DescriptionListStacked() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader>
        <CardTitle>Müşteri</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList
          layout="stacked"
          items={[
            { label: "Ad soyad", value: customer.name },
            { label: "E-posta", value: customer.email },
            { label: "Teslimat adresi", value: customer.address },
          ]}
        />
      </CardContent>
    </Card>
  )
}
