"use client"

import * as React from "react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Field, FieldLabel } from "@/components/ui/field"

const tags = ["Yeni sezon", "İndirimde", "Çok satan", "Sınırlı stok", "Hediye paketi", "Ücretsiz kargo", "Ön sipariş"]

export default function ComboboxMultiple() {
  const anchor = useComboboxAnchor()

  return (
    <Field className="w-full max-w-sm">
      <FieldLabel>Ürün etiketleri</FieldLabel>
      <Combobox multiple autoHighlight items={tags} defaultValue={["Yeni sezon", "Çok satan"]}>
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: string[]) => (
              <React.Fragment>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder={values.length ? "" : "Etiket ekle"} aria-label="Etiket ara" />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Etiket bulunamadı.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}
