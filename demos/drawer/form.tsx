"use client"

import { PlusIcon } from "lucide-react"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function DrawerForm() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>
          <PlusIcon data-icon="inline-start" />
          Not ekle
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <form
          className="mx-auto flex w-full max-w-md flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            toast.success("Not eklendi")
          }}
        >
          <DrawerHeader>
            <DrawerTitle>Siparişe not ekle</DrawerTitle>
            <DrawerDescription>Notu yalnızca mağaza ekibi görür.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="note-title">Başlık</FieldLabel>
                <Input id="note-title" defaultValue="Hediye paketi" />
              </Field>
              <Field>
                <FieldLabel htmlFor="note-body">Not</FieldLabel>
                <Textarea id="note-body" placeholder="Paketin içine kart eklenecek" />
              </Field>
            </FieldGroup>
          </DrawerBody>
          <DrawerFooter className="sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline">Vazgeç</Button>
            </DrawerClose>
            <Button type="submit">Kaydet</Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
