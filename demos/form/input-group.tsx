import { PercentIcon, SearchIcon } from "lucide-react"

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"

export default function FormInputGroup() {
  return (
    <FieldGroup className="max-w-sm">
      <Field>
        <FieldLabel htmlFor="price">Fiyat</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>₺</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput id="price" inputMode="decimal" defaultValue="1.249,90" />
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="discount">İndirim</FieldLabel>
        <InputGroup>
          <InputGroupInput id="discount" inputMode="numeric" defaultValue="25" />
          <InputGroupAddon align="inline-end">
            <PercentIcon />
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="search" className="sr-only">
          Siparişlerde ara
        </FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput id="search" placeholder="Siparişlerde ara" />
        </InputGroup>
      </Field>
    </FieldGroup>
  )
}
