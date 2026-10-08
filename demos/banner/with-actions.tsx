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
    <div className="grid w-full max-w-xl gap-3">
      <Banner
        status="warning"
        title="Paketiniz 3 gün içinde yenilenecek"
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
      <Banner
        status="danger"
        title="Eşitleme durdu"
        actions={
          <>
            <Button size="sm">Anahtarı güncelle</Button>
            <Button size="sm" variant="soft">
              Tekrar dene
            </Button>
          </>
        }
      >
        Pazaryeri API anahtarını reddetti. Son başarılı eşitleme 2 saat önce.
      </Banner>
    </div>
  )
}
