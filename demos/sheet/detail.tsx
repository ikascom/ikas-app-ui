"use client"

import { ExternalLinkIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { DescriptionList } from "@/components/ikas/description-list"

const lines = [
  { name: "Basic tişört · Siyah · M", qty: 2, price: "₺598,00" },
  { name: "Keten gömlek · Bej · L", qty: 1, price: "₺849,00" },
]

/** Record detail beside a list: the list stays in place, the sheet shows one row. */
export default function SheetDetail() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Siparişi görüntüle</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <SheetTitle>#10482</SheetTitle>
            <Badge status="warning" dot>
              Hazırlanıyor
            </Badge>
          </div>
          <SheetDescription>12 Ekim 2026, 14:32 · Online mağaza</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-5">
          <DescriptionList
            items={[
              { label: "Müşteri", value: "Deniz Yılmaz" },
              { label: "E-posta", value: "deniz@example.com" },
              { label: "Teslimat", value: "Standart kargo" },
            ]}
          />
          <Separator />
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.name} className="flex items-baseline justify-between gap-4">
                <span>
                  {line.name} <span className="text-muted-foreground">× {line.qty}</span>
                </span>
                <span className="tabular-nums">{line.price}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-baseline justify-between font-medium">
            <span>Toplam</span>
            <span className="tabular-nums">₺1.447,00</span>
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Kapat</Button>
          </SheetClose>
          <Button>
            Siparişe git
            <ExternalLinkIcon data-icon="inline-end" />
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
