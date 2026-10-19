import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Page, PageHeader } from "@/components/ikas/page"

/** Two levels deep: the trail sits above the PageHeader and ends on the screen's own title. */
export default function BreadcrumbInPage() {
  return (
    <Page>
      <div className="flex flex-col gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Siparişler</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">#10482</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>İade talebi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title="İade talebi"
        badges={<Badge status="warning">Onay bekliyor</Badge>}
        actions={
          <>
            <Button variant="outline">Reddet</Button>
            <Button>İadeyi onayla</Button>
          </>
        }
      />
      </div>
      <Card>
        <CardContent className="text-sm text-muted-foreground">2 ürün · ₺640,00 · Beden uymadı</CardContent>
      </Card>
    </Page>
  )
}
