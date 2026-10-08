"use client"

import { MoreHorizontalIcon, PackageIcon, TruckIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { DescriptionList } from "@/components/ikas/description-list"
import { Layout, LayoutColumn } from "@/components/ikas/layout"
import { Page, PageHeader } from "@/components/ikas/page"
import { channels, customer, formatMoney } from "@/demos/_data"

const lines = [
  { name: "Keten gömlek", variant: "Ekru / M", qty: 1, price: 649.9 },
  { name: "Bol paça pantolon", variant: "Siyah / 38", qty: 1, price: 450 },
  { name: "Kanvas çanta", variant: "Doğal", qty: 1, price: 150 },
]

export default function OrderDetailExample() {
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0)

  return (
    <Page>
      <PageHeader
        backAction={{ label: "Siparişler", onClick: () => toast("Siparişlere dönülüyor") }}
        title="#1048"
        titleMeta={
          <>
            <Badge tone="success" dot>
              Ödendi
            </Badge>
            <Badge tone="warning">Gönderilmedi</Badge>
          </>
        }
        description={`6 Ekim 2026, 12:24 · ${channels.marketplaceA}`}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Diğer aksiyonlar">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>İrsaliye yazdır</DropdownMenuItem>
                <DropdownMenuItem>Pazaryerine yeniden gönder</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">Siparişi iptal et</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">İade et</Button>
          </>
        }
      />
      <Layout columns="main-aside">
        <LayoutColumn>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageIcon className="size-4 text-icon" /> Gönderilmedi
                <Badge tone="warning" size="sm">
                  3 ürün
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y">
              {lines.map((line) => (
                <div key={line.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="size-10 shrink-0 rounded-md border bg-muted" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{line.name}</span>
                    <span className="text-[13px] text-muted-foreground">{line.variant}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    {formatMoney(line.price)} × {line.qty}
                  </span>
                  <span className="w-24 text-right font-medium tabular-nums">{formatMoney(line.price * line.qty)}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline">Kargo etiketi oluştur</Button>
              <Button onClick={() => toast.success("Ürünler gönderildi")}>
                <TruckIcon data-icon="inline-start" />
                Ürünleri gönder
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ödeme</CardTitle>
              <CardAction>
                <Badge tone="success" dot>
                  Ödendi
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              <div className="flex justify-between text-muted-foreground">
                <span>Ara toplam · 3 ürün</span>
                <span className="tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Kargo</span>
                <span className="tabular-nums">{formatMoney(0)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Toplam</span>
                <span className="tabular-nums">{formatMoney(subtotal)}</span>
              </div>
            </CardContent>
          </Card>
        </LayoutColumn>
        <LayoutColumn>
          <Card>
            <CardHeader>
              <CardTitle>Müşteri</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>EY</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{customer.name}</span>
                  <span className="text-[13px] text-muted-foreground">4 sipariş</span>
                </div>
              </div>
              <DescriptionList
                layout="stacked"
                items={[
                  { label: "E-posta", value: customer.email },
                  { label: "Telefon", value: customer.phone },
                  { label: "Teslimat adresi", value: customer.address },
                ]}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pazaryeri</CardTitle>
            </CardHeader>
            <CardContent>
              <DescriptionList
                layout="stacked"
                items={[
                  { label: "Kanal", value: channels.marketplaceA },
                  { label: "Paket no", value: <span className="font-mono text-[13px]">PZ-99812734</span> },
                  { label: "Son eşitleme", value: "2 dakika önce" },
                ]}
              />
            </CardContent>
          </Card>
        </LayoutColumn>
      </Layout>
    </Page>
  )
}
