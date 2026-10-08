"use client"

import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export default function ToastActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        color="red"
        onClick={() =>
          toast.success("Kural silindi", {
            description: "Düşük stok uyarısı",
            action: { label: "Geri al", onClick: () => toast("Kural geri yüklendi") },
            duration: 8000,
          })
        }
      >
        <Trash2Icon data-icon="inline-start" data-anim="wiggle" />
        Kuralı sil
      </Button>
      <Button
        onClick={() => {
          const sync = new Promise<number>((resolve) => setTimeout(() => resolve(1284), 1800))
          toast.promise(sync, {
            loading: "Ürünler eşitleniyor…",
            success: (count) => `${count.toLocaleString("tr-TR")} ürün eşitlendi`,
            error: "Eşitleme başarısız",
          })
        }}
      >
        Eşitlemeyi başlat
      </Button>
    </div>
  )
}
