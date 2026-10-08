import { Banner } from "@/components/ikas/banner"

export default function BannerTones() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Banner tone="info" title="Yeni eşitleme altyapısı">
        Ürün eşitlemesi artık saatte bir yerine 15 dakikada bir çalışıyor.
      </Banner>
      <Banner tone="success" title="Mağaza bağlandı">
        Ürünleriniz bir saat içinde pazaryerinde görünecek.
      </Banner>
      <Banner tone="warning" title="12 ürünün barkodu eksik">
        Barkod eklenene kadar bu ürünler atlanacak.
      </Banner>
      <Banner tone="critical" title="Eşitleme başarısız">
        Pazaryeri API anahtarını reddetti. Eşitlemeye devam etmek için ayarlardan güncelleyin.
      </Banner>
    </div>
  )
}
