import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CardBasic() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Ürün beslemesi</CardTitle>
        <CardDescription>Alışveriş kanallarına gönderilir, 6 saatte bir güncellenir.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Düzenle
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        1.284 ürün dahil. Barkodu olmayan 12 ürün hariç tutuldu.
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">
          Hataları görüntüle
        </Button>
        <Button size="sm">Şimdi eşitle</Button>
      </CardFooter>
    </Card>
  )
}
