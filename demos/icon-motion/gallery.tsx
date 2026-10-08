import { ArrowRightIcon, ArrowUpRightIcon, BellIcon, DownloadIcon, PencilIcon, SettingsIcon, ShoppingCartIcon, StarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const items = [
  { anim: "spin", label: "Ayarlar", Icon: SettingsIcon },
  { anim: "nudge", label: "Devam et", Icon: ArrowRightIcon, end: true },
  { anim: "lift", label: "Mağazada aç", Icon: ArrowUpRightIcon, end: true },
  { anim: "drop", label: "İndir", Icon: DownloadIcon },
  { anim: "ring", label: "Bildirimler", Icon: BellIcon },
  { anim: "wiggle", label: "Düzenle", Icon: PencilIcon },
  { anim: "bounce", label: "Sepete ekle", Icon: ShoppingCartIcon },
  { anim: "pop", label: "Favori", Icon: StarIcon },
] as const

export default function IconMotionGallery() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ anim, label, Icon, ...rest }) => (
        <div key={anim} className="flex flex-col items-center gap-2">
          <Button variant="outline" className="w-full">
            {"end" in rest ? null : <Icon data-anim={anim} data-icon="inline-start" />}
            {label}
            {"end" in rest ? <Icon data-anim={anim} data-icon="inline-end" /> : null}
          </Button>
          <code className="font-mono text-[11px] text-muted-foreground">{anim}</code>
        </div>
      ))}
    </div>
  )
}
