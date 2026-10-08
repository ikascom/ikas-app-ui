"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Collapse } from "@/components/ikas/collapse"
import { SettingRow } from "@/components/ikas/setting-row"

export default function CollapseSwitchSection() {
  const [enabled, setEnabled] = React.useState(true)

  return (
    <Card className="w-full max-w-md">
      <CardContent>
        <SettingRow
          title="Özet e-postası"
          description="Satış ve stok özetini düzenli olarak gönderir."
          htmlFor="digest"
          control={<Switch id="digest" checked={enabled} onCheckedChange={setEnabled} aria-controls="digest-options" />}
        />
        <Collapse open={enabled} id="digest-options" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="digest-frequency">Sıklık</FieldLabel>
              <Select defaultValue="weekly">
                <SelectTrigger id="digest-frequency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="daily">Her gün</SelectItem>
                  <SelectItem value="weekly">Her hafta</SelectItem>
                  <SelectItem value="monthly">Her ay</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="digest-time">Saat</FieldLabel>
              <Select defaultValue="09">
                <SelectTrigger id="digest-time" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="09">09:00</SelectItem>
                  <SelectItem value="13">13:00</SelectItem>
                  <SelectItem value="18">18:00</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Collapse>
      </CardContent>
    </Card>
  )
}
