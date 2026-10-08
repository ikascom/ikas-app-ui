"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Launchpad, type LaunchpadStep } from "@/components/ikas/launchpad"

export default function LaunchpadFirstRun() {
  const [done, setDone] = React.useState<Record<string, boolean>>({ connect: true })
  const [visible, setVisible] = React.useState(true)
  const complete = (id: string) => setDone((d) => ({ ...d, [id]: true }))
  const status = (id: string): LaunchpadStep["status"] => (done[id] ? "done" : undefined)

  if (!visible)
    return (
      <Button variant="outline" onClick={() => (setDone({ connect: true }), setVisible(true))}>
        Adımları yeniden göster
      </Button>
    )

  const steps: LaunchpadStep[] = [
    {
      id: "connect",
      label: "Hesabı bağla",
      description: "API anahtarınızla pazaryeri satıcı hesabınızı bağlayın.",
      eta: "~1 dk",
      status: status("connect"),
      actions: <Button size="sm" onClick={() => complete("connect")}>Hesabı bağla</Button>,
    },
    {
      id: "categories",
      label: "Kategorileri eşle",
      description: "ikas kategorilerinizi pazaryeri kategorileriyle eşleyin. Otomatik eşleme çoğunu halleder.",
      eta: "~2 dk",
      status: status("categories"),
      requires: ["connect"],
      actions: (
        <>
          <Button size="sm" onClick={() => complete("categories")}>Otomatik eşle</Button>
          <Button size="sm" variant="ghost">Elle eşle</Button>
        </>
      ),
    },
    {
      id: "script",
      label: "Script'i kur",
      description: "Stok ve fiyat rozetleri ürün sayfalarında görünsün.",
      eta: "~1 dk",
      status: status("script"),
      actions: <Button size="sm" onClick={() => complete("script")}>{"Script'i kur"}</Button>,
    },
    {
      id: "sync",
      label: "İlk eşitlemeyi başlat",
      description: "Birkaç dakika sürer, bitince bildirim alırsınız.",
      status: status("sync"),
      requires: ["categories"],
      actions: <Button size="sm" onClick={() => (complete("sync"), toast.success("Eşitleme başladı"))}>Eşitlemeyi başlat</Button>,
    },
  ]

  return (
    <Launchpad
      className="w-full max-w-xl"
      steps={steps}
      onComplete={() => toast.success("Kurulum tamamlandı")}
      onDismiss={() => setVisible(false)}
    />
  )
}
