"use client"

import { MoreHorizontalIcon, PrinterIcon, TruckIcon, UndoIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const actions = [
  { icon: TruckIcon, label: "Kargoya ver", message: "Kargo etiketi oluşturuldu" },
  { icon: PrinterIcon, label: "Faturayı yazdır", message: "Fatura yazıcıya gönderildi" },
  { icon: UndoIcon, label: "İade başlat", message: "İade talebi açıldı" },
]

/** Mobile action sheet: the app's row actions, reachable with a thumb. */
export default function DrawerActions() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <MoreHorizontalIcon data-icon="inline-start" />
          Sipariş işlemleri
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-left">
            <DrawerTitle>#10482 numaralı sipariş</DrawerTitle>
            <DrawerDescription>3 ürün · ₺1.840,00 · Ödendi</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-4">
            {actions.map((action) => (
              <DrawerClose key={action.label} asChild>
                <Button variant="ghost" size="lg" className="justify-start" onClick={() => toast.success(action.message)}>
                  <action.icon data-icon="inline-start" className="text-icon" />
                  {action.label}
                </Button>
              </DrawerClose>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Kapat</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
