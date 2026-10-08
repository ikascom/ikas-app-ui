"use client"

import * as React from "react"

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { NumberStepper } from "@/components/ikas/number-stepper"

export default function NumberStepperStock() {
  const [stock, setStock] = React.useState(24)

  return (
    <Field className="w-fit">
      <FieldLabel>Stok adedi</FieldLabel>
      <div>
        <NumberStepper label="Stok adedi" value={stock} onValueChange={setStock} min={0} max={9999} />
      </div>
      <FieldDescription>Değere tıklayıp doğrudan yazabilirsiniz.</FieldDescription>
    </Field>
  )
}
