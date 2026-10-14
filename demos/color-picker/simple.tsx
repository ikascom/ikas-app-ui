"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { ColorPicker } from "@/components/ikas/color-picker"

export default function ColorPickerSimple() {
  const [color, setColor] = React.useState("#3B6FE0")

  return (
    <Field className="max-w-xs">
      <FieldLabel htmlFor="brand-color">Marka rengi</FieldLabel>
      <ColorPicker id="brand-color" label="Marka rengi" value={color} onValueChange={setColor} />
      <FieldDescription>Butonlarda ve bağlantılarda kullanılır.</FieldDescription>
    </Field>
  )
}
