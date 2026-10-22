"use client"

import * as React from "react"

import { IslandToaster, island, type IslandPosition } from "@/components/ui/island-toast"
import { Button } from "@/components/ui/button"
import { SegmentedControl } from "@/components/ikas/segmented-control"

const TOASTER = "island-basic"
const options = { toasterId: TOASTER }
type Tone = "dark" | "light"
type Vertical = "top" | "bottom"
type Side = "left" | "center" | "right"

/** The page theme: the `dark` class on <html>. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}
const isDark = () => document.documentElement.classList.contains("dark")

/**
 * Every call in one place: the statuses, a promise that resolves in place, one action and
 * three in a row that fold behind each other (hover the stack to open it as a list). The tone
 * switch also switches the page theme, so each tone is shown on its own ground.
 */
export default function IslandToastBasic() {
  const dark = React.useSyncExternalStore(subscribeTheme, isDark, () => false)
  const tone: Tone = dark ? "dark" : "light"
  const [vertical, setVertical] = React.useState<Vertical>("top")
  const [side, setSide] = React.useState<Side>("center")

  // A stack on first paint, so the demo (and its thumbnail) is never an empty frame.
  // Fixed ids keep StrictMode's double effect from stacking duplicates.
  React.useEffect(() => {
    island.info("Eşitleme sıraya alındı", { ...options, id: "seed-info" })
    island.warning("3 ürün atlandı", { ...options, id: "seed-warning" })
    island.success("Ayarlar kaydedildi", { ...options, id: "seed-success" })
  }, [])

  const sync = () =>
    island.promise(
      new Promise<number>((resolve) => setTimeout(() => resolve(1284), 1800)),
      {
        loading: "Ürünler eşitleniyor",
        success: (count) => `${count.toLocaleString("tr-TR")} ürün eşitlendi`,
        error: "Eşitleme tamamlanmadı",
      },
      options
    )

  const burst = () => {
    island.info("Eşitleme sıraya alındı", { ...options, description: "Yaklaşık 2 dakika içinde başlar." })
    setTimeout(() => island.warning("3 ürün atlandı", { ...options, description: "Barkodu olmayan ürünler gönderilmedi." }), 350)
    setTimeout(() => island.success("Ayarlar kaydedildi", options), 700)
  }

  const action = () =>
    island.success("Kural silindi", {
      ...options,
      id: "rule-deleted",
      description: "Düşük stok uyarısı",
      action: { label: "Geri al", onClick: () => island("Kural geri yüklendi", options) },
    })

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="relative h-72 w-full overflow-hidden rounded-xl border bg-muted/40">
        <IslandToaster id={TOASTER} tone={tone} position={`${vertical}-${side}` as IslandPosition} className="absolute" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => island.success("Ayarlar kaydedildi", options)}>
            Başarılı
          </Button>
          <Button variant="outline" onClick={() => island.error("Kaydedilemedi", { ...options, description: "Bağlantı koptu. Tekrar deneyin." })}>
            Hata
          </Button>
          <Button variant="outline" onClick={sync}>
            Promise
          </Button>
          <Button variant="outline" onClick={action}>
            Aksiyonlu
          </Button>
          <Button onClick={burst}>Art arda 3</Button>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <SegmentedControl
            aria-label="Ton"
            mode="radio"
            size="sm"
            value={tone}
            onValueChange={(v) => {
              document.documentElement.classList.toggle("dark", v === "dark")
              action()
            }}
            options={[
              { value: "dark", label: "Siyah" },
              { value: "light", label: "Beyaz" },
            ]}
          />
          <SegmentedControl
            aria-label="Kenar"
            mode="radio"
            size="sm"
            value={vertical}
            onValueChange={(v) => {
              setVertical(v)
              action()
            }}
            options={[
              { value: "top", label: "Üst" },
              { value: "bottom", label: "Alt" },
            ]}
          />
          <SegmentedControl
            aria-label="Yan"
            mode="radio"
            size="sm"
            value={side}
            onValueChange={(v) => {
              setSide(v)
              action()
            }}
            options={[
              { value: "left", label: "Sol" },
              { value: "center", label: "Orta" },
              { value: "right", label: "Sağ" },
            ]}
          />
        </div>
        <p className="text-[13px] text-muted-foreground">Üstüne gel: liste açılır. Öndekini kenara doğru kaydır ya da Esc ile kapat.</p>
      </div>
    </div>
  )
}
