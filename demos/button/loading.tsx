"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

export default function ButtonLoading() {
  const [saving, setSaving] = React.useState(false)

  function save() {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button loading={saving} onClick={save}>
        Ayarları kaydet
      </Button>
      <Button variant="outline" loading>
        Ürünler eşitleniyor
      </Button>
    </div>
  )
}
