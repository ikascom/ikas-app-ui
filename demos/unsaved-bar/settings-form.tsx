"use client"

import * as React from "react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { UnsavedBar } from "@/components/ikas/unsaved-bar"
import { SettingRow } from "@/components/ikas/setting-row"

const initial = { senderName: "Moda Butik", autoReply: true }

export default function UnsavedBarSettingsForm() {
  const [saved, setSaved] = React.useState(initial)
  const [values, setValues] = React.useState(initial)
  const [saving, setSaving] = React.useState(false)
  const dirty = JSON.stringify(values) !== JSON.stringify(saved)

  function save() {
    setSaving(true)
    setTimeout(() => {
      setSaved(values)
      setSaving(false)
      toast.success("Ayarlar kaydedildi")
    }, 900)
  }

  return (
    <div className="relative flex min-h-80 w-full max-w-lg flex-col">
      <Card>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="sender-name">Gönderen adı</FieldLabel>
              <Input
                id="sender-name"
                value={values.senderName}
                onChange={(event) => setValues({ ...values, senderName: event.target.value })}
              />
            </Field>
            <SettingRow
              htmlFor="auto-reply"
              title="Otomatik yanıt"
              description="Mesai saatleri dışında gelen mesajları yanıtla."
              control={
                <Switch
                  id="auto-reply"
                  checked={values.autoReply}
                  onCheckedChange={(autoReply) => setValues({ ...values, autoReply })}
                />
              }
            />
          </FieldGroup>
        </CardContent>
      </Card>
      <p className="mt-3 text-center text-[13px] text-muted-foreground">Kaydetme çubuğunu görmek için bir değeri değiştirin.</p>
      <div className="mt-auto">
        <UnsavedBar
          position="sticky"
          className="px-0 pb-0"
          open={dirty}
          saving={saving}
          onSave={save}
          onDiscard={() => setValues(saved)}
        />
      </div>
    </div>
  )
}
