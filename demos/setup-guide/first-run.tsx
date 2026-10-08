"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { SetupGuide } from "@/components/ikas/setup-guide"

export default function SetupGuideFirstRun() {
  const [done, setDone] = React.useState<Record<string, boolean>>({ connect: true })
  const [visible, setVisible] = React.useState(true)
  const complete = (id: string) => setDone((d) => ({ ...d, [id]: true }))

  if (!visible)
    return (
      <Button variant="outline" onClick={() => (setDone({ connect: true }), setVisible(true))}>
        Rehberi yeniden göster
      </Button>
    )

  const steps = [
    { id: "connect", title: "Hesabınızı bağlayın", description: "API anahtarınızla pazaryeri satıcı hesabınızı bağlayın.", done: Boolean(done.connect), action: <Button size="sm" onClick={() => complete("connect")}>Bağla</Button> },
    {
      id: "categories",
      title: "Kategorileri eşleyin",
      description: "ikas kategorilerinizi pazaryeri kategorileriyle eşleyin. Otomatik eşleme çoğunu halleder.",
      done: Boolean(done.categories),
      action: (
        <>
          <Button size="sm" onClick={() => complete("categories")}>Otomatik eşle</Button>
          <Button size="sm" variant="ghost">Elle eşle</Button>
        </>
      ),
    },
    { id: "script", title: "Mağaza script'ini kurun", description: "Stok ve fiyat rozetleri ürün sayfalarında görünsün.", done: Boolean(done.script), action: <Button size="sm" onClick={() => complete("script")}>Kur</Button> },
    {
      id: "test",
      title: "İlk eşitlemeyi çalıştırın",
      description: "Birkaç dakika sürer, bitince bildirim alırsınız.",
      done: Boolean(done.test),
      action: <Button size="sm" onClick={() => (complete("test"), toast.success("Eşitleme başladı"))}>Eşitlemeyi başlat</Button>,
    },
  ]
  const allDone = steps.every((s) => s.done)

  return (
    <SetupGuide
      className="w-full max-w-xl"
      description="Uygulamayı kullanmaya başlamak için dört adım."
      steps={steps}
      onDismiss={allDone ? () => setVisible(false) : undefined}
    />
  )
}
