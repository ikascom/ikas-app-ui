import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DescriptionList } from "@/components/ikas/description-list"

export default function DescriptionListHorizontal() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Ödeme</CardTitle>
      </CardHeader>
      <CardContent>
        <DescriptionList
          items={[
            { label: "Durum", value: <Badge tone="success" dot>Ödendi</Badge> },
            { label: "Yöntem", value: "Kredi kartı · •••• 4242" },
            { label: "Taksit", value: "3" },
            { label: "İşlem numarası", value: <span className="font-mono text-[13px]">TRX-20261006-4821</span> },
          ]}
        />
      </CardContent>
    </Card>
  )
}
