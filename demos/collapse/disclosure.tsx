"use client"

import * as React from "react"
import { PencilIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Collapse } from "@/components/ikas/collapse"

export default function CollapseDisclosure() {
  const [open, setOpen] = React.useState(false)
  const id = React.useId()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tetikleyici</CardTitle>
        <CardDescription>Stok 10 adedin altına düştüğünde</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
            {open ? <XIcon data-icon="inline-start" /> : <PencilIcon data-icon="inline-start" data-anim="wiggle" />}
            {open ? "Kapat" : "Değiştir"}
          </Button>
        </CardAction>
      </CardHeader>
      <Collapse open={open} id={id}>
        <CardContent>
          <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor={`${id}-threshold`}>Eşik</FieldLabel>
              <Input id={`${id}-threshold`} defaultValue={10} inputMode="numeric" />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-sku`}>Ürün kodu</FieldLabel>
              <Input id={`${id}-sku`} placeholder="Tüm ürünler" />
            </Field>
          </div>
        </CardContent>
      </Collapse>
    </Card>
  )
}
