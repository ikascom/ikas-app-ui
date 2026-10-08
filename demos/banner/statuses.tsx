import { Banner } from "@/components/ikas/banner"

export default function BannerStatuses() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Banner status="info" title="Yeni eşitleme altyapısı">
        Ürün eşitlemesi artık saatte bir yerine 15 dakikada bir çalışıyor.
      </Banner>
      <Banner status="success" title="Mağaza bağlandı">
        Ürünleriniz bir saat içinde pazaryerinde görünecek.
      </Banner>
      <Banner status="warning" title="12 ürünün barkodu eksik">
        Barkod eklenene kadar bu ürünler atlanacak.
      </Banner>
      <Banner status="danger" title="Eşitleme başarısız">
        Pazaryeri API anahtarını reddetti. Eşitlemeye devam etmek için <a href="#">ayarlardan</a> güncelleyin.
      </Banner>
    </div>
  )
}
