"use client"

import { SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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

const statuses = ["Onaylandı", "Hazırlanıyor", "Kargoda", "Teslim edildi"]

export default function SheetFilters() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontalIcon data-icon="inline-start" />
          Filtreler
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Filtreler</SheetTitle>
          <SheetDescription>Liste filtreler uygulanınca yenilenir.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <FieldGroup>
            <FieldSet>
              <FieldLegend variant="label">Durum</FieldLegend>
              {statuses.map((status, i) => (
                <Field key={status} orientation="horizontal">
                  <Checkbox id={`status-${i}`} defaultChecked={i < 2} />
                  <FieldLabel htmlFor={`status-${i}`} className="font-normal">
                    {status}
                  </FieldLabel>
                </Field>
              ))}
            </FieldSet>
            <Field>
              <FieldLabel htmlFor="min-total">En az tutar</FieldLabel>
              <Input id="min-total" inputMode="decimal" placeholder="₺0" />
            </Field>
          </FieldGroup>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="ghost">Sıfırla</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button>Uygula</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
