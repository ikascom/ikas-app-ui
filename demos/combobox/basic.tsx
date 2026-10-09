"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

const categories = [
  "Aksesuar",
  "Ayakkabı",
  "Çanta",
  "Elbise",
  "Gömlek",
  "Kazak",
  "Mont",
  "Pantolon",
  "Şapka",
  "Tişört",
]

export default function ComboboxBasic() {
  return (
    <Field className="w-full max-w-xs">
      <FieldLabel htmlFor="category">Kategori</FieldLabel>
      <Combobox items={categories} defaultValue="Tişört">
        <ComboboxInput id="category" placeholder="Kategori ara" showClear />
        <ComboboxContent>
          <ComboboxEmpty>Kategori bulunamadı.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>Yazarak listeyi daraltın.</FieldDescription>
    </Field>
  )
}
