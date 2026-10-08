"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Banner } from "@/components/ikas/banner"

export default function BannerWithActions() {
  const [visible, setVisible] = React.useState(true)

  if (!visible) {
    return (
      <Button variant="outline" onClick={() => setVisible(true)}>
        Banner’ı tekrar göster
      </Button>
    )
  }

  return (
    <Banner
      status="warning"
      title="Paketiniz 3 gün içinde yenilenecek"
      className="max-w-xl"
      onDismiss={() => setVisible(false)}
      actions={
        <>
          <Button size="sm" variant="outline">
            Paketi yönet
          </Button>
          <Button size="sm" variant="ghost">
            Faturaları görüntüle
          </Button>
        </>
      }
    >
      Sonu 4242 ile biten karttan ₺499,00 tahsil edilecek.
    </Banner>
  )
}
