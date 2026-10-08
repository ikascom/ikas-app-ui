import { Banner } from "@/components/ikas/banner"

export default function BannerSurface() {
  return (
    <div className="grid w-full max-w-xl gap-3">
      <Banner variant="surface" status="info" title="Fiyatlar günde bir kez eşitlenir">
        ikas’ta yaptığınız değişiklikler pazaryerine gece ulaşır.
      </Banner>
      <Banner variant="surface" status="success" title="Webhook doğrulandı">
        Sipariş güncellemeleri anlık olarak iletilir.
      </Banner>
    </div>
  )
}
