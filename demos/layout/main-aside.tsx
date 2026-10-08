import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layout, LayoutColumn } from "@/components/ikas/layout"

export default function LayoutMainAside() {
  return (
    <Layout columns="main-aside">
      <LayoutColumn>
        <Card>
          <CardHeader>
            <CardTitle>Ana alan</CardTitle>
          </CardHeader>
          <CardContent className="h-32 text-muted-foreground">Ana içerik: ürünler, zaman akışı, formlar.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ana alan</CardTitle>
          </CardHeader>
          <CardContent className="h-20 text-muted-foreground">Kartlar 20px aralıkla alt alta dizilir.</CardContent>
        </Card>
      </LayoutColumn>
      <LayoutColumn>
        <Card>
          <CardHeader>
            <CardTitle>Yan alan</CardTitle>
          </CardHeader>
          <CardContent className="h-24 text-muted-foreground">Müşteri, notlar, ek bilgiler.</CardContent>
        </Card>
      </LayoutColumn>
    </Layout>
  )
}
