"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { DateWheelPicker } from "@/components/ikas/date-wheel-picker"

const short = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })

export default function DateWheelPickerDrawer() {
  const [open, setOpen] = React.useState(false)
  const [saved, setSaved] = React.useState(new Date(1994, 4, 19))
  const [draft, setDraft] = React.useState(saved)

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setDraft(saved)
      }}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal sm:w-48">
          <CalendarIcon data-icon="inline-start" className="text-icon" />
          <span className="tabular-nums">{short.format(saved)}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto flex w-full max-w-sm flex-col">
          <DrawerHeader>
            <DrawerTitle>Doğum tarihi</DrawerTitle>
            <DrawerDescription>Müşterinin doğum gününde kampanya kodu gönderilir.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <DateWheelPicker aria-label="Doğum tarihi" value={draft} onValueChange={setDraft} maxDate={new Date()} className="sm:w-full" />
          </DrawerBody>
          <DrawerFooter className="sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline">Vazgeç</Button>
            </DrawerClose>
            <Button
              onClick={() => {
                setSaved(draft)
                setOpen(false)
                toast.success("Doğum tarihi kaydedildi")
              }}
            >
              Kaydet
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
