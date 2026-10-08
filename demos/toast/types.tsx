"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export default function ToastTypes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={() => toast.success("Ayarlar kaydedildi")}>
        Başarılı
      </Button>
      <Button variant="outline" onClick={() => toast.info("Eşitleme sıraya alındı", { description: "Yaklaşık 2 dakika içinde başlar." })}>
        Bilgi
      </Button>
      <Button variant="outline" onClick={() => toast.warning("3 ürün atlandı", { description: "Barkodu olmayan ürünler gönderilmedi." })}>
        Uyarı
      </Button>
      <Button variant="outline" onClick={() => toast.error("Kaydedilemedi", { description: "Bağlantı koptu. Tekrar deneyin." })}>
        Hata
      </Button>
      <Button variant="ghost" onClick={() => toast("Bağlantı panoya kopyalandı")}>
        Sade
      </Button>
    </div>
  )
}
